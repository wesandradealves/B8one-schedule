import {
  assertRequiredCsvHeaders,
  buildCsvContent,
  deduplicateCsvRows,
  parseCsvDocument,
} from '@/domain/commons/utils/csv.util';

describe('csv.util', () => {
  it('parses csv document with quoted values', () => {
    const csv = 'name,description\n"Exam, A","Line ""1"""';

    const parsed = parseCsvDocument(csv);

    expect(parsed.headers).toEqual(['name', 'description']);
    expect(parsed.rows).toEqual([{ name: 'Exam, A', description: 'Line "1"' }]);
  });

  it('throws when row column count is invalid', () => {
    expect(() => parseCsvDocument('name,email\nJohn')).toThrow(
      'Row 2 has 1 columns, expected 2',
    );
  });

  it('checks required headers', () => {
    expect(() => assertRequiredCsvHeaders(['name'], ['name', 'email'])).toThrow(
      'Missing required CSV headers: email',
    );
  });

  it('builds csv content escaping quoted fields', () => {
    const csvContent = buildCsvContent(['name', 'notes'], [
      { name: 'Exam A', notes: 'Simple' },
      { name: 'Exam, B', notes: 'Line "quoted"' },
    ]);

    expect(csvContent).toBe(
      'name,notes\nExam A,Simple\n"Exam, B","Line ""quoted"""',
    );
  });

  it('deduplicates identical csv rows keeping original row numbers', () => {
    const rows = [
      { name: 'Exam A', durationMinutes: '20' },
      { name: 'Exam A', durationMinutes: '20' },
      { name: 'Exam B', durationMinutes: '30' },
    ];

    const result = deduplicateCsvRows(rows);

    expect(result.uniqueRows).toEqual([
      { row: rows[0], rowNumber: 2 },
      { row: rows[2], rowNumber: 4 },
    ]);
    expect(result.duplicateRows).toEqual([
      { row: rows[1], rowNumber: 3 },
    ]);
  });
});
