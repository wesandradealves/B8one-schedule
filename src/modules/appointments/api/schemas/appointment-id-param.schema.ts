import { z } from 'zod';

export const appointmentIdParamSchema = z.object({
  id: z.string().uuid(),
});
