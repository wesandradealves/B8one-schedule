import { z } from 'zod';

export const listAppointmentAvailabilityQuerySchema = z
  .object({
    examId: z.string().uuid(),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .refine((value) => value.startsAt.getTime() < value.endsAt.getTime(), {
    message: '"startsAt" must be before "endsAt"',
    path: ['startsAt'],
  });

export type ListAppointmentAvailabilityQuerySchemaType = z.infer<
  typeof listAppointmentAvailabilityQuerySchema
>;
