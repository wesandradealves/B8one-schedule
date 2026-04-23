import { z } from 'zod';

export const verifyTwoFactorSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .regex(/^\d{6}$/, 'Code must contain exactly 6 digits'),
});

export type VerifyTwoFactorSchemaType = z.infer<typeof verifyTwoFactorSchema>;
