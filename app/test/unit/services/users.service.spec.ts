import api from '@/services/api';
import { executeRequest } from '@/utils/request';
import {
  deleteUserById,
  exportUsersCsv,
  getUserById,
  importUsersCsv,
  listUsers,
  updateUserById,
} from '@/services/users.service';

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/utils/request', () => ({
  executeRequest: jest.fn(),
}));

describe('users service', () => {
  const mockedApi = api as unknown as {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    delete: jest.Mock;
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

  it('should list users through paginated all endpoint', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      data: [],
      page: 1,
      limit: 8,
      total: 0,
      totalPages: 0,
    });

    const params = { page: 2, limit: 8, sortBy: 'profile' as const, sortOrder: 'ASC' as const };
    await listUsers(params);

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/users/all', { params });
  });

  it('should delete user by id through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue(undefined);

    await deleteUserById('user-1');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.delete).toHaveBeenCalledWith('/users/user-1');
  });

  it('should import users csv through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    await importUsersCsv('fullName,email,profile,isActive\nJohn,john@b8one.com,CLIENT,true');

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.post).toHaveBeenCalledWith('/users/import/csv', {
      csvContent: 'fullName,email,profile,isActive\nJohn,john@b8one.com,CLIENT,true',
    });
  });

  it('should export users csv through executeRequest', async () => {
    (executeRequest as jest.Mock).mockResolvedValue({
      fileName: 'users.csv',
      csvContent: 'fullName,email,profile,isActive',
    });

    await exportUsersCsv();

    expect(executeRequest).toHaveBeenCalledTimes(1);
    const requestFactory = (executeRequest as jest.Mock).mock.calls[0][0];
    await requestFactory();
    expect(mockedApi.get).toHaveBeenCalledWith('/users/export/csv');
  });
});
