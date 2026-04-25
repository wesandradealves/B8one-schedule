import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { dateFnsLocalizer, Views, type View } from 'react-big-calendar';

export const OPERATION_START_HOUR = 7;
export const OPERATION_END_HOUR = 19;

const locales = {
  'pt-BR': ptBR,
};

export const EXAM_CALENDAR_LOCALIZER = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
});

export const EXAM_CALENDAR_MESSAGES = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+${total} mais`,
};

export const EXAM_CALENDAR_VIEWS: View[] = [Views.DAY, Views.WEEK, Views.MONTH];

const toMinutesOfDay = (date: Date): number => date.getHours() * 60 + date.getMinutes();

export const isValidCalendarDate = (date: unknown): date is Date => {
  return date instanceof Date && !Number.isNaN(date.getTime());
};

export const isWithinOperationWindow = (
  start: Date,
  durationMinutes: number,
): boolean => {
  if (!isValidCalendarDate(start)) {
    return false;
  }

  const end = new Date(start.getTime() + durationMinutes * 60_000);
  if (!isValidCalendarDate(end)) {
    return false;
  }

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (!isSameDay) {
    return false;
  }

  const startMinutes = toMinutesOfDay(start);
  const endMinutes = toMinutesOfDay(end);

  return (
    startMinutes >= OPERATION_START_HOUR * 60 &&
    endMinutes <= OPERATION_END_HOUR * 60
  );
};

export const toViewRange = (
  baseDate: Date,
  view: View,
): { startsAt: Date; endsAt: Date } => {
  if (view === Views.DAY) {
    return {
      startsAt: startOfDay(baseDate),
      endsAt: endOfDay(baseDate),
    };
  }

  if (view === Views.MONTH) {
    const monthStart = startOfMonth(baseDate);
    const monthEnd = endOfMonth(baseDate);

    return {
      startsAt: startOfWeek(monthStart, { weekStartsOn: 0 }),
      endsAt: endOfWeek(monthEnd, { weekStartsOn: 0 }),
    };
  }

  return {
    startsAt: startOfWeek(baseDate, { weekStartsOn: 0 }),
    endsAt: endOfWeek(baseDate, { weekStartsOn: 0 }),
  };
};

export const getDayAvailabilityKey = (value: Date): string => format(value, 'yyyy-MM-dd');
