import {
  PaginatedResult,
  PaginationQuery,
} from '@/domain/commons/interfaces/pagination.interface';

export async function collectAllPaginatedData<T>(
  listFn: (pagination: PaginationQuery) => Promise<PaginatedResult<T>>,
  limit = 500,
): Promise<T[]> {
  const output: T[] = [];
  let page = 1;

  while (true) {
    const result = await listFn({ page, limit });
    output.push(...result.data);

    if (result.totalPages === 0 || page >= result.totalPages) {
      break;
    }

    page += 1;
  }

  return output;
}
