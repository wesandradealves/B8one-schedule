import { z } from 'zod';

export const verifyPasswordRecoveryCodeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .regex(/^\d{6}$/, 'Code must contain exactly 6 digits'),
});

export type VerifyPasswordRecoveryCodeSchemaType = z.infer<
  typeof verifyPasswordRecoveryCodeSchema
>;

