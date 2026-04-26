import type { UserProfile } from '@/types/auth';

export type UserListSortBy = 'createdAt' | 'profile' | 'isActive';

export interface User {
  id: string;
  fullName: string;
  email: string;
  profile: UserProfile;
  isActive: boolean;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  password?: string;
  profile?: UserProfile;
  isActive?: boolean;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  profile: UserProfile;
}
