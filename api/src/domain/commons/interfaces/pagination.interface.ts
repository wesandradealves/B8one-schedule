import { SortOrder } from '@/domain/commons/enums/sort-order.enum';

export interface PaginationQuery {
  page: number;
  limit: number;
  sortOrder?: SortOrder;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
