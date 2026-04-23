export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string;
  details?: Array<{ path: string; message: string }>;
}
