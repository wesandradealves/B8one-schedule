import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().trim().min(3).max(255),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  profile: z.nativeEnum(UserProfile),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;
