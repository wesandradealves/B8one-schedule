import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import {
  login,
  requestPasswordRecovery,
  resetPassword,
  verifyEmailConfirmation,
  verifyPasswordRecoveryCode,
  verifyTwoFactor,
} from '@/services/auth.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('@/utils/request', () => ({
  executeRequest: jest.fn(),
}));

describe('auth service', () => {
  const mockedApi = api as unknown as {
    post: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call login endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: 'code sent',
      twoFactorExpiresInSeconds: 600,
    });

    const payload = { email: 'a@b.com', password: '123456' };
    await login(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', payload);
  });

  it('should call verify 2fa endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      profile: 'ADMIN',
    });

    const payload = { email: 'a@b.com', code: '123456' };
    await verifyTwoFactor(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/2fa/verify', payload);
  });

  it('should call password recovery request endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: 'code sent',
      twoFactorExpiresInSeconds: 600,
    });

    const payload = { email: 'a@b.com' };
    await requestPasswordRecovery(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password-recovery/request', payload);
  });

  it('should call password recovery verify endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      verified: true,
      message: 'ok',
    });

    const payload = { email: 'a@b.com', code: '123456' };
    await verifyPasswordRecoveryCode(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password-recovery/verify', payload);
  });

  it('should call password reset endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      message: 'done',
    });

    const payload = { email: 'a@b.com', code: '123456', newPassword: 'Strong@123' };
    await resetPassword(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/password-recovery/reset', payload);
  });

  it('should call email confirmation verify endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      message: 'E-mail confirmado com sucesso. Conta ativada.',
    });

    const payload = { token: 'token-123' };
    await verifyEmailConfirmation(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/email-confirmation/verify', payload);
  });
});
