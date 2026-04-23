import { AppointmentStatus } from '@/domain/commons/enums/appointment-status.enum';
import { z } from 'zod';

export const updateAppointmentSchema = z
  .object({
    examId: z.string().uuid().optional(),
    scheduledAt: z.coerce.date().optional(),
    notes: z.string().trim().max(500).nullable().optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
  })
  .refine(
    (value) =>
      value.examId !== undefined ||
      value.scheduledAt !== undefined ||
      value.notes !== undefined ||
      value.status !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  );

export type UpdateAppointmentSchemaType = z.infer<typeof updateAppointmentSchema>;
