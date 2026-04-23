import { UserProfile } from '@/domain/commons/enums/user-profile.enum';
import { SetMetadata } from '@nestjs/common';

export const PROFILES_KEY = 'profiles';
export const Profiles = (...profiles: UserProfile[]) => SetMetadata(PROFILES_KEY, profiles);
