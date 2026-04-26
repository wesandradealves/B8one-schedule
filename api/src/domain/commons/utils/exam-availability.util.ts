import { BadRequestException } from '@nestjs/common';

export const DEFAULT_EXAM_AVAILABLE_WEEKDAYS = [1, 2, 3, 4, 5] as const;
export const DEFAULT_EXAM_AVAILABLE_START_TIME = '07:00';
export const DEFAULT_EXAM_AVAILABLE_END_TIME = '19:00';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface ExamAvailabilityConfig {
  availableWeekdays: number[];
  availableStartTime: string;
  availableEndTime: string;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}

export interface ExamAvailabilitySource {
  availableWeekdays?: number[] | null;
  availableStartTime?: string | null;
  availableEndTime?: string | null;
  availableFromDate?: string | null;
  availableToDate?: string | null;
}

const isValidWeekday = (value: unknown): value is number => {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 6;
};

export const normalizeExamAvailableWeekdays = (
  weekdays: ExamAvailabilitySource['availableWeekdays'],
): number[] => {
  const source =
    weekdays !== undefined && weekdays !== null
      ? weekdays
      : [...DEFAULT_EXAM_AVAILABLE_WEEKDAYS];

  return [...new Set(source)]
    .map((value) => Number(value))
    .sort((first, second) => first - second);
};

export const normalizeExamAvailability = (
  input: ExamAvailabilitySource,
): ExamAvailabilityConfig => {
  return {
    availableWeekdays: normalizeExamAvailableWeekdays(input.availableWeekdays),
    availableStartTime:
      input.availableStartTime?.trim() || DEFAULT_EXAM_AVAILABLE_START_TIME,
    availableEndTime:
      input.availableEndTime?.trim() || DEFAULT_EXAM_AVAILABLE_END_TIME,
    availableFromDate: input.availableFromDate ?? null,
    availableToDate: input.availableToDate ?? null,
  };
};

export const toTimeMinutes = (value: string): number | null => {
  const matches = TIME_PATTERN.exec(value);
  if (!matches) {
    return null;
  }

  const hours = Number(matches[1]);
  const minutes = Number(matches[2]);

  return hours * 60 + minutes;
};

export const isValidAvailabilityDate = (value: string): boolean => {
  return DATE_PATTERN.test(value);
};

export const getDateKey = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const validateExamAvailability = (
  config: ExamAvailabilityConfig,
): void => {
  if (config.availableWeekdays.length === 0) {
    throw new BadRequestException(
      'At least one available weekday must be provided',
    );
  }

  if (!config.availableWeekdays.every((value) => isValidWeekday(value))) {
    throw new BadRequestException(
      'Available weekdays must use values between 0 and 6',
    );
  }

  const startMinutes = toTimeMinutes(config.availableStartTime);
  const endMinutes = toTimeMinutes(config.availableEndTime);

  if (startMinutes === null) {
    throw new BadRequestException(
      'Available start time must follow HH:mm format',
    );
  }

  if (endMinutes === null) {
    throw new BadRequestException(
      'Available end time must follow HH:mm format',
    );
  }

  if (endMinutes <= startMinutes) {
    throw new BadRequestException(
      'Available end time must be later than available start time',
    );
  }

  if (config.availableFromDate && !isValidAvailabilityDate(config.availableFromDate)) {
    throw new BadRequestException(
      'Available from date must follow YYYY-MM-DD format',
    );
  }

  if (config.availableToDate && !isValidAvailabilityDate(config.availableToDate)) {
    throw new BadRequestException(
      'Available to date must follow YYYY-MM-DD format',
    );
  }

  if (
    config.availableFromDate &&
    config.availableToDate &&
    config.availableFromDate > config.availableToDate
  ) {
    throw new BadRequestException(
      'Available from date must be before or equal to available to date',
    );
  }
};

const isSameLocalDay = (first: Date, second: Date): boolean => {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

export const isScheduledAtWithinExamAvailability = (
  scheduledAt: Date,
  durationMinutes: number,
  config: ExamAvailabilityConfig,
): boolean => {
  if (Number.isNaN(scheduledAt.getTime()) || durationMinutes <= 0) {
    return false;
  }

  if (!config.availableWeekdays.includes(scheduledAt.getDay())) {
    return false;
  }

  const dateKey = getDateKey(scheduledAt);
  if (config.availableFromDate && dateKey < config.availableFromDate) {
    return false;
  }
  if (config.availableToDate && dateKey > config.availableToDate) {
    return false;
  }

  const end = new Date(scheduledAt.getTime() + durationMinutes * 60_000);
  if (!isSameLocalDay(scheduledAt, end)) {
    return false;
  }

  const startMinutes = toTimeMinutes(config.availableStartTime);
  const endMinutes = toTimeMinutes(config.availableEndTime);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  const scheduledStartMinutes =
    scheduledAt.getHours() * 60 + scheduledAt.getMinutes();
  const scheduledEndMinutes = end.getHours() * 60 + end.getMinutes();

  return (
    scheduledStartMinutes >= startMinutes &&
    scheduledEndMinutes <= endMinutes
  );
};
