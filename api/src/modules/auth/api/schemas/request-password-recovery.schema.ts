import { z } from 'zod';

export const requestPasswordRecoverySchema = z.object({
  email: z.string().email(),
});

export type RequestPasswordRecoverySchemaType = z.infer<
  typeof requestPasswordRecoverySchema
>;

