import {
  formatCurrencyFromCents,
  formatDateTime,
  toDateInputValue,
  toDateTimeLocalValue,
} from '@/utils/format';

describe('format utils', () => {
  it('should format currency from cents', () => {
    expect(formatCurrencyFromCents(12345)).toContain('123,45');
  });

  it('should format date time and return fallback for invalid date', () => {
    expect(formatDateTime('2026-05-01T10:00:00.000Z')).not.toBe('-');
    expect(formatDateTime('invalid')).toBe('-');
  });

  it('should map date values to date input format', () => {
    expect(toDateInputValue('2026-05-01T10:00:00.000Z')).toBe('2026-05-01');
    expect(toDateInputValue('invalid')).toBe('');
  });

  it('should map date values to datetime-local format', () => {
    expect(toDateTimeLocalValue('2026-05-01T10:00:00.000Z')).toHaveLength(16);
    expect(toDateTimeLocalValue('invalid')).toBe('');
  });
});
