import {
  DEFAULT_EXAM_AVAILABLE_END_TIME,
  DEFAULT_EXAM_AVAILABLE_START_TIME,
  DEFAULT_EXAM_AVAILABLE_WEEKDAYS,
  getDateKey,
  getWeekdaySummary,
  isDateInsideExamAvailabilityDay,
  isWithinExamAvailability,
  normalizeExamAvailability,
  validateExamAvailability,
} from '@/utils/exam-availability';

describe('exam availability utils', () => {
  it('normalizes default availability values', () => {
    const result = normalizeExamAvailability(null);

    expect(result).toEqual({
      availableWeekdays: [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS],
      availableStartTime: DEFAULT_EXAM_AVAILABLE_START_TIME,
      availableEndTime: DEFAULT_EXAM_AVAILABLE_END_TIME,
      availableFromDate: null,
      availableToDate: null,
    });
  });

  it('normalizes and sorts weekdays', () => {
    const result = normalizeExamAvailability({
      availableWeekdays: [4, 2, 2, 1],
      availableStartTime: '08:00',
      availableEndTime: '18:00',
      availableFromDate: '2026-05-01',
      availableToDate: '2026-05-31',
    });

    expect(result.availableWeekdays).toEqual([1, 2, 4]);
  });

  it('validates availability errors', () => {
    const invalid = validateExamAvailability({
      availableWeekdays: [],
      availableStartTime: '19:00',
      availableEndTime: '07:00',
      availableFromDate: '2026-12-31',
      availableToDate: '2026-01-01',
    });

    expect(invalid.availableWeekdays).toBe('Selecione ao menos um dia disponível');
    expect(invalid.availableEndTime).toBe(
      'O horário final deve ser maior que o horário inicial',
    );
    expect(invalid.availableToDate).toBe(
      'A data final deve ser maior ou igual à data inicial',
    );
  });

  it('checks whether a date is allowed by weekday and range', () => {
    const availability = normalizeExamAvailability({
      availableWeekdays: [2],
      availableFromDate: '2026-01-01',
      availableToDate: '2026-01-31',
    });

    expect(
      isDateInsideExamAvailabilityDay(
        new Date('2026-01-06T10:00:00.000Z'),
        availability,
      ),
    ).toBe(true);
    expect(
      isDateInsideExamAvailabilityDay(
        new Date('2026-01-07T10:00:00.000Z'),
        availability,
      ),
    ).toBe(false);
    expect(
      isDateInsideExamAvailabilityDay(
        new Date('2026-02-03T10:00:00.000Z'),
        availability,
      ),
    ).toBe(false);
  });

  it('checks whether slot is within availability window', () => {
    const availability = normalizeExamAvailability({
      availableWeekdays: [2],
      availableStartTime: '09:00',
      availableEndTime: '12:00',
    });

    expect(
      isWithinExamAvailability(
        new Date(2026, 0, 6, 10, 0, 0, 0),
        30,
        availability,
      ),
    ).toBe(true);
    expect(
      isWithinExamAvailability(
        new Date(2026, 0, 6, 11, 50, 0, 0),
        30,
        availability,
      ),
    ).toBe(false);
  });

  it('formats helper outputs', () => {
    expect(getWeekdaySummary([1, 2, 5])).toBe('seg, ter, sex');
    expect(getDateKey(new Date('2026-01-01T00:00:00.000Z'))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
