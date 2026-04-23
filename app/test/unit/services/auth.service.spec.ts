import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import { login, verifyTwoFactor } from '@/services/auth.service';

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call login endpoint through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      requiresTwoFactor: true,
      message: 'code sent',
    });

    const payload = { email: 'a@b.com', password: '123456' };
    await login(payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect((api as any).post).toHaveBeenCalledWith('/auth/login', payload);
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
    expect((api as any).post).toHaveBeenCalledWith('/auth/2fa/verify', payload);
  });
});
