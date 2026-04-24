export type SortOrder = 'ASC' | 'DESC';

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQueryParams {
  page?: number;
  limit?: number;
  sortOrder?: SortOrder;
}

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

export interface ApiErrorPayload {
  statusCode: number;
  message: string;
  details?: Array<{ path: string; message: string }>;
}
