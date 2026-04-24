export interface CsvImportError {
  row: number;
  message: string;
}

export interface CsvImportResult {
  processedRows: number;
  createdRows: number;
  updatedRows: number;
  skippedRows: number;
  errors: CsvImportError[];
}

export interface CsvExportResult {
  fileName: string;
  csvContent: string;
}
