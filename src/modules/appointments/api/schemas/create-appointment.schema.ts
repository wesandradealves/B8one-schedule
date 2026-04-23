import { z } from 'zod';

export const createAppointmentSchema = z.object({
  examId: z.string().uuid(),
  scheduledAt: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateAppointmentSchemaType = z.infer<typeof createAppointmentSchema>;
