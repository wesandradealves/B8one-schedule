import { z } from 'zod';
import { UserListSortBy } from '@/domain/commons/enums/user-list-sort-by.enum';
import { paginationQuerySchema } from '@/modules/shared/utils/pagination-query.schema';

export const listUsersQuerySchema = paginationQuerySchema.extend({
  sortBy: z.nativeEnum(UserListSortBy).default(UserListSortBy.CREATED_AT),
});

export type ListUsersQuerySchemaType = z.infer<typeof listUsersQuerySchema>;
