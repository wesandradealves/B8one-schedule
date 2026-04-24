import type { UserProfile } from '@/types/auth';

export interface User {
  id: string;
  fullName: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
}

export interface UpdateUserPayload {
  fullName?: string;
  password?: string;
}
