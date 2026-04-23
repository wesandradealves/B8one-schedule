import { z } from 'zod';

export const createExamSchema = z.object({
  name: z.string().trim().min(2).max(255),
  description: z.string().trim().max(3000).nullable().optional(),
  durationMinutes: z.coerce.number().int().positive(),
  priceCents: z.coerce.number().int().nonnegative(),
});

export type CreateExamSchemaType = z.infer<typeof createExamSchema>;
