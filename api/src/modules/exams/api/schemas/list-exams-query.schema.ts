import { z } from 'zod';
import { paginationQuerySchema } from '@/modules/shared/utils/pagination-query.schema';
import { ExamListSortBy } from '@/domain/commons/enums/exam-list-sort-by.enum';

export const listExamsQuerySchema = paginationQuerySchema.extend({
  sortBy: z.nativeEnum(ExamListSortBy).default(ExamListSortBy.CREATED_AT),
});

export type ListExamsQuerySchemaType = z.infer<typeof listExamsQuerySchema>;

