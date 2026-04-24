export type CsvRow = Record<string, string>;

export interface ParsedCsvDocument {
  headers: string[];
  rows: CsvRow[];
}

type CsvValue = string | number | boolean | Date | null | undefined;

export function parseCsvDocument(csvContent: string): ParsedCsvDocument {
  const normalized = normalizeCsvContent(csvContent);
  const rawRows = parseRawRows(normalized);

  if (rawRows.length === 0) {
    throw new Error('CSV is empty');
  }

  const headers = rawRows[0].map((value) => value.trim());
  validateHeaders(headers);

  const rows = rawRows.slice(1).map((rawRow, index) => {
    if (rawRow.length !== headers.length) {
      throw new Error(
        `Row ${index + 2} has ${rawRow.length} columns, expected ${headers.length}`,
      );
    }

    const row: CsvRow = {};
    headers.forEach((header, columnIndex) => {
      row[header] = rawRow[columnIndex].trim();
    });

    return row;
  });

  return { headers, rows };
}

export function assertRequiredCsvHeaders(
  headers: string[],
  requiredHeaders: string[],
): void {
  const missingHeaders = requiredHeaders.filter(
    (requiredHeader) => !headers.includes(requiredHeader),
  );

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
  }
}

export function buildCsvContent(
  headers: string[],
  rows: Array<Record<string, CsvValue>>,
): string {
  validateHeaders(headers);

  const output = [
    headers.map((header) => escapeCsvValue(header)).join(','),
    ...rows.map((row) =>
      headers
        .map((header) => formatCsvValue(row[header]))
        .map((value) => escapeCsvValue(value))
        .join(','),
    ),
  ];

  return output.join('\n');
}

function normalizeCsvContent(csvContent: string): string {
  const withoutBom = csvContent.replace(/^\uFEFF/, '');
  return withoutBom.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function validateHeaders(headers: string[]): void {
  if (headers.length === 0) {
    throw new Error('CSV headers are required');
  }

  const emptyHeader = headers.find((header) => header.length === 0);
  if (emptyHeader !== undefined) {
    throw new Error('CSV headers cannot be empty');
  }

  const uniqueHeaders = new Set(headers);
  if (uniqueHeaders.size !== headers.length) {
    throw new Error('CSV headers must be unique');
  }
}

function parseRawRows(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (char === '"') {
      const nextChar = content[index + 1];
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\n' && !inQuotes) {
      row.push(field);
      field = '';
      if (!isRowEmpty(row)) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (inQuotes) {
    throw new Error('CSV contains unmatched quotes');
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (!isRowEmpty(row)) {
      rows.push(row);
    }
  }

  return rows;
}

function isRowEmpty(row: string[]): boolean {
  return row.every((cell) => cell.trim().length === 0);
}

function formatCsvValue(value: CsvValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

function escapeCsvValue(value: string): string {
  if (value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  if (value.includes(',') || value.includes('\n')) {
    return `"${value}"`;
  }

  return value;
}
