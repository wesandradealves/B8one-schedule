import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import type {
  LoginPayload,
  LoginResponse,
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
