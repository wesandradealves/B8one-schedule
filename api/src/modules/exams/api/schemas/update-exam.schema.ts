import { z } from 'zod';

export const updateExamSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    description: z.string().trim().max(3000).nullable().optional(),
    durationMinutes: z.coerce.number().int().positive().optional(),
    priceCents: z.coerce.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.durationMinutes !== undefined ||
      value.priceCents !== undefined ||
      value.isActive !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  );

export type UpdateExamSchemaType = z.infer<typeof updateExamSchema>;
