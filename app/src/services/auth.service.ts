import api from '@/services/api';
import type {
  LoginPayload,
  LoginResponse,
  VerifyTwoFactorPayload,
  VerifyTwoFactorResponse,
} from '@/types/auth';

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', payload);
  return response.data;
};

export const verifyTwoFactor = async (
  payload: VerifyTwoFactorPayload,
): Promise<VerifyTwoFactorResponse> => {
  const response = await api.post<VerifyTwoFactorResponse>('/auth/2fa/verify', payload);
  return response.data;
};
