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
  twoFactorExpiresInSeconds: number;
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

export interface RequestPasswordRecoveryPayload {
  email: string;
}

export interface RequestPasswordRecoveryResponse {
  requiresTwoFactor: true;
  message: string;
  twoFactorExpiresInSeconds: number;
}

export interface VerifyPasswordRecoveryCodePayload {
  email: string;
  code: string;
}

export interface VerifyPasswordRecoveryCodeResponse {
  verified: true;
  message: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyEmailConfirmationPayload {
  token: string;
}

export interface VerifyEmailConfirmationResponse {
  message: string;
}

export type AuthFlowMode = 'login' | 'recovery';

export type AuthFlowStep =
  | 'login-credentials'
  | 'login-two-factor'
  | 'recovery-email'
  | 'recovery-two-factor'
  | 'recovery-reset'
  | 'recovery-result';

export type AuthFlowField =
  | 'email'
  | 'password'
  | 'code'
  | 'newPassword'
  | 'confirmNewPassword';

export type AuthFlowMessageLevel = 'info' | 'success' | 'error';

export interface AuthFlowMessage {
  level: AuthFlowMessageLevel;
  text: string;
}
