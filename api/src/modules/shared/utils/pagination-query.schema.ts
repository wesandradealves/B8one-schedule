import { z } from 'zod';
import { SortOrder } from '@/domain/commons/enums/sort-order.enum';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC),
});

export type PaginationQuerySchemaType = z.infer<typeof paginationQuerySchema>;
