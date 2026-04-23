import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { z } from 'zod';

export const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(3).max(255).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).max(128).optional(),
    profile: z.nativeEnum(UserProfile).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.fullName !== undefined ||
      value.email !== undefined ||
      value.password !== undefined ||
      value.profile !== undefined ||
      value.isActive !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  );

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
