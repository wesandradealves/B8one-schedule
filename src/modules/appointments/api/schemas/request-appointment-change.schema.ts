import { z } from 'zod';

export const requestAppointmentChangeSchema = z
  .object({
    examId: z.string().uuid().optional(),
    scheduledAt: z.coerce.date().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .refine(
    (value) =>
      value.examId !== undefined ||
      value.scheduledAt !== undefined ||
      value.notes !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  );

export type RequestAppointmentChangeSchemaType = z.infer<
  typeof requestAppointmentChangeSchema
>;
