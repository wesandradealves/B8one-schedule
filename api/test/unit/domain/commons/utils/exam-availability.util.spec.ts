import { BadRequestException } from '@nestjs/common';
import {
  DEFAULT_EXAM_AVAILABLE_END_TIME,
  DEFAULT_EXAM_AVAILABLE_START_TIME,
  DEFAULT_EXAM_AVAILABLE_WEEKDAYS,
  getDateKey,
  isScheduledAtWithinExamAvailability,
  normalizeExamAvailability,
  validateExamAvailability,
} from '@/domain/commons/utils/exam-availability.util';

describe('exam-availability util', () => {
  it('normalizes defaults when fields are missing', () => {
    const result = normalizeExamAvailability({});

    expect(result).toEqual({
      availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
      availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
      availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
      availableFromDate: null,
      availableToDate: null,
    });
  });

  it('normalizes weekdays with uniqueness and sorting', () => {
    const result = normalizeExamAvailability({
      availableWeekdays: [5, 1, 1, 3, 5],
      availableStartTime: '08:00',
      availableEndTime: '17:00',
    });

    expect(result.availableWeekdays).toEqual([1, 3, 5]);
  });

  it('validates invalid weekday values', () => {
    expect(() => {
      validateExamAvailability({
        availableWeekdays: [1, 7],
        availableStartTime: '07:00',
        availableEndTime: '19:00',
        availableFromDate: null,
        availableToDate: null,
      });
    }).toThrow(
      new BadRequestException(
        'Available weekdays must use values between 0 and 6',
      ),
    );
  });

  it('validates invalid time ranges', () => {
    expect(() => {
      validateExamAvailability({
        availableWeekdays: [1],
        availableStartTime: '18:00',
        availableEndTime: '09:00',
        availableFromDate: null,
        availableToDate: null,
      });
    }).toThrow(
      new BadRequestException(
        'Available end time must be later than available start time',
      ),
    );
  });

  it('validates invalid date intervals', () => {
    expect(() => {
      validateExamAvailability({
        availableWeekdays: [1],
        availableStartTime: '09:00',
        availableEndTime: '18:00',
        availableFromDate: '2026-02-01',
        availableToDate: '2026-01-01',
      });
    }).toThrow(
      new BadRequestException(
        'Available from date must be before or equal to available to date',
      ),
    );
  });

  it('checks if scheduled date is inside availability', () => {
    const available = normalizeExamAvailability({
      availableWeekdays: [2],
      availableStartTime: '09:00',
      availableEndTime: '12:00',
      availableFromDate: '2026-01-01',
      availableToDate: '2026-01-31',
    });

    const validTuesday = new Date(2026, 0, 6, 10, 0, 0, 0);
    expect(
      isScheduledAtWithinExamAvailability(
        validTuesday,
        30,
        available,
      ),
    ).toBe(true);
  });

  it('returns false for out-of-window, wrong weekday and out-of-range dates', () => {
    const available = normalizeExamAvailability({
      availableWeekdays: [2],
      availableStartTime: '09:00',
      availableEndTime: '10:00',
      availableFromDate: '2026-01-01',
      availableToDate: '2026-01-31',
    });

    expect(
      isScheduledAtWithinExamAvailability(
        new Date(2026, 0, 6, 11, 0, 0, 0),
        30,
        available,
      ),
    ).toBe(false);

    expect(
      isScheduledAtWithinExamAvailability(
        new Date(2026, 0, 7, 9, 0, 0, 0),
        30,
        available,
      ),
    ).toBe(false);

    expect(
      isScheduledAtWithinExamAvailability(
        new Date(2026, 1, 3, 9, 0, 0, 0),
        30,
        available,
      ),
    ).toBe(false);
  });

  it('builds date keys using local calendar components', () => {
    expect(getDateKey(new Date('2026-01-01T00:00:00.000Z'))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
