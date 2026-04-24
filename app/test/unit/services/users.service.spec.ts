import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import { getUserById, updateUserById } from '@/services/users.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock('@/utils/request', () => ({
  executeRequest: jest.fn(),
}));

describe('users service', () => {
  const mockedApi = api as unknown as {
    get: jest.Mock;
    patch: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user by id through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      id: 'user-1',
      fullName: 'Cliente Teste',
      email: 'cliente@b8one.com',
      profile: 'CLIENT',
      isActive: true,
    });

    await getUserById('user-1');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/users/user-1');
  });

  it('should update user by id through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      id: 'user-1',
      fullName: 'Cliente Teste',
      email: 'cliente@b8one.com',
      profile: 'CLIENT',
      isActive: true,
    });

    const payload = {
      password: 'NovaSenha123',
    };
    await updateUserById('user-1', payload);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.patch).toHaveBeenCalledWith('/users/user-1', payload);
  });
});
