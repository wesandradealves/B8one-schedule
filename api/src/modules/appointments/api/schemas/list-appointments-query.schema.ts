import { z } from 'zod';
import { paginationQuerySchema } from '@/modules/shared/utils/pagination-query.schema';
import { AppointmentListSortBy } from '@/domain/commons/enums/appointment-list-sort-by.enum';

export const listAppointmentsQuerySchema = paginationQuerySchema.extend({
  sortBy: z.nativeEnum(AppointmentListSortBy).default(AppointmentListSortBy.SCHEDULED_AT),
  scheduledDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()), {
      message: 'Invalid date format',
    })
    .optional(),
});

export type ListAppointmentsQuerySchemaType = z.infer<
  typeof listAppointmentsQuerySchema
>;
