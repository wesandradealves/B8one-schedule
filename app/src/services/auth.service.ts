import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import type {
  LoginPayload,
  LoginResponse,
  RequestPasswordRecoveryPayload,
  RequestPasswordRecoveryResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerifyPasswordRecoveryCodePayload,
  VerifyPasswordRecoveryCodeResponse,
  VerifyTwoFactorPayload,
  VerifyTwoFactorResponse,
} from '@/types/auth';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  return executeRequest(() => api.post<LoginResponse>('/auth/login', payload));
};

export const verifyTwoFactor = async (
  payload: VerifyTwoFactorPayload,
): Promise<VerifyTwoFactorResponse> => {
  return executeRequest(() => api.post<VerifyTwoFactorResponse>('/auth/2fa/verify', payload));
};

export const requestPasswordRecovery = async (
  payload: RequestPasswordRecoveryPayload,
): Promise<RequestPasswordRecoveryResponse> => {
  return executeRequest(() =>
    api.post<RequestPasswordRecoveryResponse>('/auth/password-recovery/request', payload),
  );
};

export const verifyPasswordRecoveryCode = async (
  payload: VerifyPasswordRecoveryCodePayload,
): Promise<VerifyPasswordRecoveryCodeResponse> => {
  return executeRequest(() =>
    api.post<VerifyPasswordRecoveryCodeResponse>('/auth/password-recovery/verify', payload),
  );
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> => {
  return executeRequest(() =>
    api.post<ResetPasswordResponse>('/auth/password-recovery/reset', payload),
  );
};
