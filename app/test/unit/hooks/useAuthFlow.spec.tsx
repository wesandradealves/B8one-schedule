import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuthFlowStore } from '@/hooks/useAuthFlow.store';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import {
  login,
  requestPasswordRecovery,
  resetPassword,
  verifyPasswordRecoveryCode,
  verifyTwoFactor,
} from '@/services/auth.service';

const replaceMock = jest.fn();
const searchParamGetMock = jest.fn();
const setSessionMock = jest.fn();
const publishMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  useSearchParams: () => ({
    get: searchParamGetMock,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    setSession: setSessionMock,
  }),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
  verifyTwoFactor: jest.fn(),
  requestPasswordRecovery: jest.fn(),
  verifyPasswordRecoveryCode: jest.fn(),
  resetPassword: jest.fn(),
}));

describe('useAuthFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParamGetMock.mockReturnValue(null);
    useAuthFlowStore.getState().resetState();
  });

  it('should move login flow from credentials to 2fa step', async () => {
    (login as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: '2FA sent',
      twoFactorExpiresInSeconds: 600,
    });

    const { result } = renderHook(() => useAuthFlow());

    act(() => {
      result.current.setField('email', 'admin@b8one.com');
      result.current.setField('password', 'Admin@123');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    expect(login).toHaveBeenCalledWith({
      email: 'admin@b8one.com',
      password: 'Admin@123',
    });

    expect(result.current.step).toBe('login-two-factor');
    expect(result.current.message).toEqual({
      level: 'info',
      text: '2FA sent',
    });
    expect(result.current.twoFactorExpiresInSeconds).toBe(600);
  });

  it('should validate 2fa, set session and redirect to next app route', async () => {
    searchParamGetMock.mockReturnValue('/app/exams');
    (login as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: '2FA sent',
      twoFactorExpiresInSeconds: 600,
    });
    (verifyTwoFactor as jest.Mock).mockResolvedValue({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      profile: 'ADMIN',
    });

    const { result } = renderHook(() => useAuthFlow());

    act(() => {
      result.current.setField('email', 'admin@b8one.com');
      result.current.setField('password', 'Admin@123');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    act(() => {
      result.current.setField('code', '123456');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    expect(verifyTwoFactor).toHaveBeenCalledWith({
      email: 'admin@b8one.com',
      code: '123456',
    });
    expect(setSessionMock).toHaveBeenCalledWith('jwt-token');
    expect(replaceMock).toHaveBeenCalledWith('/app/exams');
  });

  it('should complete recovery flow in steps and finish with success message', async () => {
    (requestPasswordRecovery as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: 'code sent',
      twoFactorExpiresInSeconds: 600,
    });
    (verifyPasswordRecoveryCode as jest.Mock).mockResolvedValue({
      verified: true,
      message: 'code verified',
    });
    (resetPassword as jest.Mock).mockResolvedValue({
      message: 'Password updated successfully.',
    });

    const { result } = renderHook(() => useAuthFlow());

    act(() => {
      result.current.switchToRecovery();
      result.current.setField('email', 'cliente@b8one.com');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });
    expect(result.current.step).toBe('recovery-two-factor');

    act(() => {
      result.current.setField('code', '654321');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });
    expect(result.current.step).toBe('recovery-reset');

    act(() => {
      result.current.setField('newPassword', 'Client@1234');
      result.current.setField('confirmNewPassword', 'Client@1234');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    expect(resetPassword).toHaveBeenCalledWith({
      email: 'cliente@b8one.com',
      code: '654321',
      newPassword: 'Client@1234',
    });
    expect(result.current.step).toBe('recovery-result');
    expect(result.current.message).toEqual({
      level: 'success',
      text: 'Senha atualizada com sucesso.',
    });
  });

  it('should block submission with validation errors and avoid service calls', async () => {
    const { result } = renderHook(() => useAuthFlow());

    act(() => {
      result.current.setField('email', 'invalid-email');
      result.current.setField('password', '123');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    expect(login).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.email).toBeDefined();
    expect(result.current.fieldErrors.password).toBeDefined();
  });

  it('should allow back navigation without changing route in recovery flow', () => {
    const { result } = renderHook(() => useAuthFlow());

    act(() => {
      result.current.switchToRecovery();
    });

    expect(result.current.step).toBe('recovery-email');

    act(() => {
      result.current.goBack();
    });

    expect(result.current.step).toBe('login-credentials');
  });

  it('should go to recovery-result with error when reset password fails', async () => {
    (requestPasswordRecovery as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: 'code sent',
      twoFactorExpiresInSeconds: 600,
    });
    (verifyPasswordRecoveryCode as jest.Mock).mockResolvedValue({
      verified: true,
      message: 'code verified',
    });
    (resetPassword as jest.Mock).mockRejectedValue(new Error('Invalid or expired verification code'));

    const { result } = renderHook(() => useAuthFlow());

    act(() => {
      result.current.switchToRecovery();
      result.current.setField('email', 'cliente@b8one.com');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    act(() => {
      result.current.setField('code', '654321');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    act(() => {
      result.current.setField('newPassword', 'Client@1234');
      result.current.setField('confirmNewPassword', 'Client@1234');
    });

    await act(async () => {
      await result.current.submitCurrentStep();
    });

    await waitFor(() => {
      expect(result.current.step).toBe('recovery-result');
    });
    expect(result.current.message).toEqual({
      level: 'error',
      text: 'Código de verificação inválido ou expirado.',
    });
  });
});
