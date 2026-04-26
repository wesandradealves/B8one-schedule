import type { Exam } from '@/types/exam';

export interface ExamAvailabilityConfig {
  availableWeekdays: number[];
  availableStartTime: string;
  availableEndTime: string;
  availableFromDate: string | null;
  availableToDate: string | null;
}

export interface ExamAvailabilityValidationErrors {
  availableWeekdays?: string;
  availableStartTime?: string;
  availableEndTime?: string;
  availableFromDate?: string;
  availableToDate?: string;
}

export const DEFAULT_EXAM_AVAILABLE_WEEKDAYS = [1, 2, 3, 4, 5] as const;
export const DEFAULT_EXAM_AVAILABLE_START_TIME = '07:00';
export const DEFAULT_EXAM_AVAILABLE_END_TIME = '19:00';

export const EXAM_WEEKDAY_OPTIONS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidWeekday = (value: unknown): value is number => {
  return Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 6;
};

export const normalizeAvailableWeekdays = (
  weekdays?: number[] | null,
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
  input?: Partial<ExamAvailabilityConfig> | Exam | null,
): ExamAvailabilityConfig => {
  return {
    availableWeekdays: normalizeAvailableWeekdays(input?.availableWeekdays),
    availableStartTime:
      input?.availableStartTime?.trim() || DEFAULT_EXAM_AVAILABLE_START_TIME,
    availableEndTime:
      input?.availableEndTime?.trim() || DEFAULT_EXAM_AVAILABLE_END_TIME,
    availableFromDate: input?.availableFromDate ?? null,
    availableToDate: input?.availableToDate ?? null,
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

export const getDateKey = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const validateExamAvailability = (
  config: ExamAvailabilityConfig,
): ExamAvailabilityValidationErrors => {
  const errors: ExamAvailabilityValidationErrors = {};

  if (config.availableWeekdays.length === 0) {
    errors.availableWeekdays = 'Selecione ao menos um dia disponível';
  } else if (!config.availableWeekdays.every((value) => isValidWeekday(value))) {
    errors.availableWeekdays = 'Os dias disponíveis devem usar valores entre 0 e 6';
  }

  const startMinutes = toTimeMinutes(config.availableStartTime);
  const endMinutes = toTimeMinutes(config.availableEndTime);

  if (startMinutes === null) {
    errors.availableStartTime = 'Informe um horário inicial válido no formato HH:mm';
  }

  if (endMinutes === null) {
    errors.availableEndTime = 'Informe um horário final válido no formato HH:mm';
  }

  if (
    startMinutes !== null &&
    endMinutes !== null &&
    endMinutes <= startMinutes
  ) {
    errors.availableEndTime = 'O horário final deve ser maior que o horário inicial';
  }

  if (config.availableFromDate && !DATE_PATTERN.test(config.availableFromDate)) {
    errors.availableFromDate = 'Informe uma data inicial válida';
  }

  if (config.availableToDate && !DATE_PATTERN.test(config.availableToDate)) {
    errors.availableToDate = 'Informe uma data final válida';
  }

  if (
    config.availableFromDate &&
    config.availableToDate &&
    DATE_PATTERN.test(config.availableFromDate) &&
    DATE_PATTERN.test(config.availableToDate) &&
    config.availableFromDate > config.availableToDate
  ) {
    errors.availableToDate =
      'A data final deve ser maior ou igual à data inicial';
  }

  return errors;
};

export const isDateInsideExamAvailabilityDay = (
  date: Date,
  availability: ExamAvailabilityConfig,
): boolean => {
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (!availability.availableWeekdays.includes(date.getDay())) {
    return false;
  }

  const dateKey = getDateKey(date);
  if (availability.availableFromDate && dateKey < availability.availableFromDate) {
    return false;
  }
  if (availability.availableToDate && dateKey > availability.availableToDate) {
    return false;
  }

  return true;
};

const isSameLocalDay = (first: Date, second: Date): boolean => {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
};

export const isWithinExamAvailability = (
  slotStart: Date,
  durationMinutes: number,
  availability: ExamAvailabilityConfig,
): boolean => {
  if (Number.isNaN(slotStart.getTime()) || durationMinutes <= 0) {
    return false;
  }

  if (!isDateInsideExamAvailabilityDay(slotStart, availability)) {
    return false;
  }

  const end = new Date(slotStart.getTime() + durationMinutes * 60_000);
  if (!isSameLocalDay(slotStart, end)) {
    return false;
  }

  const startMinutes = toTimeMinutes(availability.availableStartTime);
  const endMinutes = toTimeMinutes(availability.availableEndTime);
  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  const slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
  const slotEndMinutes = end.getHours() * 60 + end.getMinutes();

  return slotStartMinutes >= startMinutes && slotEndMinutes <= endMinutes;
};

export const getWeekdaySummary = (weekdays: number[]): string => {
  const labels = EXAM_WEEKDAY_OPTIONS.filter((option) =>
    weekdays.includes(option.value),
  ).map((option) => option.label.toLowerCase());

  return labels.join(', ');
};
