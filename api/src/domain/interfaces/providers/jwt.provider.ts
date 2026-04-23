import { AuthenticatedUser } from '@/domain/types/authenticated-user.type';

export interface IJwtProvider {
  signAccessToken(user: AuthenticatedUser): Promise<string>;
}

export const IJwtProvider = Symbol('IJwtProvider');
