import { z } from 'zod';

export const examIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ExamIdParamSchemaType = z.infer<typeof examIdParamSchema>;
