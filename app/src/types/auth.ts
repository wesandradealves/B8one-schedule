export type UserProfile = 'ADMIN' | 'CLIENT';

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  message: string;
}

export interface VerifyTwoFactorPayload {
  email: string;
  code: string;
}

export interface VerifyTwoFactorResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  profile: UserProfile;
}
