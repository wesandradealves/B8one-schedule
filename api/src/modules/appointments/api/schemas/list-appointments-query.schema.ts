import { z } from 'zod';
import { paginationQuerySchema } from '@/modules/shared/utils/pagination-query.schema';

export const listAppointmentsQuerySchema = paginationQuerySchema.extend({
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
