import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .regex(/^\d{6}$/, 'Code must contain exactly 6 digits'),
  newPassword: z.string().min(6).max(128),
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;

