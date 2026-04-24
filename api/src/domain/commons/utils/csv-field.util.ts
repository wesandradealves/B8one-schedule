export function getRequiredCsvValue(
  row: Record<string, string>,
  field: string,
  rowNumber: number,
): string {
  const value = row[field]?.trim();

  if (!value) {
    throw new Error(`Row ${rowNumber}: "${field}" is required`);
  }

  return value;
}

export function getOptionalCsvValue(
  row: Record<string, string>,
  field: string,
): string | null {
  const value = row[field]?.trim();
  return value ? value : null;
}

export function parseCsvBoolean(
  value: string | null,
  field: string,
  rowNumber: number,
  defaultValue?: boolean,
): boolean {
  if (value === null || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    throw new Error(`Row ${rowNumber}: "${field}" is required`);
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }

  throw new Error(
    `Row ${rowNumber}: "${field}" must be one of true/false/1/0/yes/no`,
  );
}

export function parseCsvInteger(
  value: string | null,
  field: string,
  rowNumber: number,
): number {
  if (value === null || value === '') {
    throw new Error(`Row ${rowNumber}: "${field}" is required`);
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Row ${rowNumber}: "${field}" must be an integer`);
  }

  return parsed;
}

export function parseCsvDate(
  value: string | null,
  field: string,
  rowNumber: number,
): Date {
  if (value === null || value === '') {
    throw new Error(`Row ${rowNumber}: "${field}" is required`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Row ${rowNumber}: "${field}" must be a valid date`);
  }

  return parsed;
}
