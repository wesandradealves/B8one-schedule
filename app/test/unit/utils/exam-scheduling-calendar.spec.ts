import { Views } from 'react-big-calendar';
import { endOfMonth, startOfMonth } from 'date-fns';
import {
  EXAM_CALENDAR_LOCALIZER,
  EXAM_CALENDAR_MESSAGES,
  EXAM_CALENDAR_VIEWS,
  OPERATION_END_HOUR,
  OPERATION_START_HOUR,
  getDayAvailabilityKey,
  isValidCalendarDate,
  isWithinOperationWindow,
  toViewRange,
} from '@/utils/exam-scheduling-calendar';

describe('exam scheduling calendar utils', () => {
  it('exposes localized labels and supported views', () => {
    expect(EXAM_CALENDAR_MESSAGES.today).toBe('Hoje');
    expect(EXAM_CALENDAR_MESSAGES.next).toBe('Próximo');
    expect(EXAM_CALENDAR_MESSAGES.showMore(3)).toBe('+3 mais');
    expect(EXAM_CALENDAR_VIEWS).toEqual([Views.DAY, Views.WEEK, Views.MONTH]);
  });

  it('validates calendar date objects', () => {
    expect(isValidCalendarDate(new Date())).toBe(true);
    expect(isValidCalendarDate(new Date(Number.NaN))).toBe(false);
    expect(isValidCalendarDate('2026-04-01')).toBe(false);
  });

  it('checks if slot is within operation window and same day', () => {
    const openBoundary = new Date(2026, 3, 25, OPERATION_START_HOUR, 0, 0, 0);
    const closeBoundary = new Date(2026, 3, 25, OPERATION_END_HOUR - 1, 40, 0, 0);
    const beforeOpen = new Date(2026, 3, 25, OPERATION_START_HOUR - 1, 59, 0, 0);
    const afterClose = new Date(2026, 3, 25, OPERATION_END_HOUR - 1, 50, 0, 0);
    const crossDay = new Date(2026, 3, 25, 23, 55, 0, 0);

    expect(isWithinOperationWindow(openBoundary, 20)).toBe(true);
    expect(isWithinOperationWindow(closeBoundary, 20)).toBe(true);
    expect(isWithinOperationWindow(beforeOpen, 20)).toBe(false);
    expect(isWithinOperationWindow(afterClose, 20)).toBe(false);
    expect(isWithinOperationWindow(crossDay, 20)).toBe(false);
    expect(isWithinOperationWindow(new Date(Number.NaN), 20)).toBe(false);
  });

  it('computes ranges by current view', () => {
    const baseDate = new Date(2026, 3, 24, 12, 0, 0, 0); // friday

    const dayRange = toViewRange(baseDate, Views.DAY);
    expect(dayRange.startsAt.getHours()).toBe(0);
    expect(dayRange.endsAt.getHours()).toBe(23);

    const weekRange = toViewRange(baseDate, Views.WEEK);
    expect(weekRange.startsAt.getDay()).toBe(0);
    expect(weekRange.endsAt.getDay()).toBe(6);

    const monthRange = toViewRange(baseDate, Views.MONTH);
    expect(monthRange.startsAt.getDay()).toBe(0);
    expect(monthRange.endsAt.getDay()).toBe(6);
    expect(monthRange.startsAt.getTime()).toBeLessThanOrEqual(startOfMonth(baseDate).getTime());
    expect(monthRange.endsAt.getTime()).toBeGreaterThanOrEqual(endOfMonth(baseDate).getTime());
  });

  it('returns day keys and localized start-of-week', () => {
    const key = getDayAvailabilityKey(new Date('2026-04-25T00:00:00.000Z'));
    expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const startOfWeek = EXAM_CALENDAR_LOCALIZER.startOfWeek('pt-BR');
    expect(startOfWeek).toBe(0);
  });
});
