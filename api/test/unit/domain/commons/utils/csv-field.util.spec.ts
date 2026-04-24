import {
  getOptionalCsvValue,
  getRequiredCsvValue,
  parseCsvBoolean,
  parseCsvDate,
  parseCsvInteger,
} from '@/domain/commons/utils/csv-field.util';

describe('csv-field.util', () => {
  it('returns required value and optional value correctly', () => {
    const row = { name: ' John ', empty: '  ' };

    expect(getRequiredCsvValue(row, 'name', 2)).toBe('John');
    expect(getOptionalCsvValue(row, 'name')).toBe('John');
    expect(getOptionalCsvValue(row, 'empty')).toBeNull();
  });

  it('parses boolean variations', () => {
    expect(parseCsvBoolean('true', 'isActive', 2)).toBe(true);
    expect(parseCsvBoolean('0', 'isActive', 2)).toBe(false);
    expect(parseCsvBoolean('', 'isActive', 2, true)).toBe(true);
  });

  it('throws on invalid boolean/integer/date', () => {
    expect(() => parseCsvBoolean('invalid', 'isActive', 2)).toThrow(
      'Row 2: "isActive" must be one of true/false/1/0/yes/no',
    );
    expect(() => parseCsvInteger('a', 'priceCents', 3)).toThrow(
      'Row 3: "priceCents" must be an integer',
    );
    expect(() => parseCsvDate('not-date', 'scheduledAt', 4)).toThrow(
      'Row 4: "scheduledAt" must be a valid date',
    );
  });
});
