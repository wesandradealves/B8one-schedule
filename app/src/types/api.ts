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

export interface ApiErrorPayload {
  statusCode: number;
  message: string;
  details?: Array<{ path: string; message: string }>;
}
