import { z } from 'zod';

export const verifyEmailConfirmationSchema = z.object({
  token: z.string().trim().min(1).max(512),
});

export type VerifyEmailConfirmationSchemaType = z.infer<
  typeof verifyEmailConfirmationSchema
>;
