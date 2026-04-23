import { UserProfile } from '@/domain/commons/enums/user-profile.enum';

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: UserProfile;
}
