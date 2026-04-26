import { act, renderHook, waitFor } from '@testing-library/react';
import { useUsersList } from '@/hooks/useUsersList';
import {
  deleteUserById,
  exportUsersCsv,
  importUsersCsv,
  listUsers,
  updateUserById,
} from '@/services/users.service';

const useAuthMock = jest.fn();
const useRolePermissionsMock = jest.fn();
const publishMock = jest.fn();
const logoutMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

jest.mock('@/hooks/useRolePermissions', () => ({
  useRolePermissions: () => useRolePermissionsMock(),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/hooks/useLogout', () => ({
  useLogout: () => logoutMock,
}));

jest.mock('@/services/users.service', () => ({
  listUsers: jest.fn(),
  updateUserById: jest.fn(),
  deleteUserById: jest.fn(),
  importUsersCsv: jest.fn(),
  exportUsersCsv: jest.fn(),
}));

jest.mock('@/utils/csv', () => ({
  isCsvFile: jest.fn(() => true),
  downloadCsvFile: jest.fn(),
}));

describe('useUsersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
    });
    useRolePermissionsMock.mockReturnValue({
      isAdmin: true,
      canManageExams: true,
      canManageAppointments: true,
      canManageUsers: true,
    });

    (listUsers as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'user-1',
          fullName: 'Cliente Teste',
          email: 'cliente@b8one.com',
          profile: 'CLIENT',
          isActive: true,
        },
      ],
      page: 1,
      limit: 8,
      total: 1,
      totalPages: 1,
    });
  });

  it('should load users for admin profile', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listUsers).toHaveBeenCalledWith({
      page: 1,
      limit: 8,
      sortOrder: 'DESC',
      sortBy: 'createdAt',
    });
    expect(result.current.authenticatedUserId).toBe('admin-1');
    expect(result.current.users).toHaveLength(1);
  });

  it('should skip listing when user cannot manage users', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listUsers).not.toHaveBeenCalled();
    expect(result.current.users).toEqual([]);

    act(() => {
      result.current.startEdit({
        id: 'user-1',
        fullName: 'Cliente',
        email: 'cliente@b8one.com',
        profile: 'CLIENT',
        isActive: true,
      });
    });
    expect(result.current.editingUserId).toBeNull();
  });

  it('should validate full name before saving', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.users[0]);
      result.current.setEditField('fullName', 'A');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith('error', 'Informe o nome com ao menos 3 caracteres.');
  });

  it('should save user edits and reload list', async () => {
    (updateUserById as jest.Mock).mockResolvedValue({ id: 'user-1' });

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.users[0]);
      result.current.setEditField('fullName', 'Cliente Atualizado');
      result.current.setEditField('email', 'cliente.atualizado@b8one.com');
      result.current.setEditField('profile', 'ADMIN');
      result.current.setEditField('isActive', false);
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateUserById).toHaveBeenCalledWith('user-1', {
      fullName: 'Cliente Atualizado',
      email: 'cliente.atualizado@b8one.com',
      profile: 'ADMIN',
      isActive: false,
    });
    expect(publishMock).toHaveBeenCalledWith('success', 'Usuário atualizado com sucesso.');
  });

  it('should validate email before saving', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.users[0]);
      result.current.setEditField('email', 'invalid-email');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith('error', 'Informe um e-mail válido.');
  });

  it('should force logout when logged user changes own role/email/status', async () => {
    (listUsers as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'admin-1',
          fullName: 'Admin',
          email: 'admin@b8one.com',
          profile: 'ADMIN',
          isActive: true,
        },
      ],
      page: 1,
      limit: 8,
      total: 1,
      totalPages: 1,
    });
    (updateUserById as jest.Mock).mockResolvedValue({ id: 'admin-1' });

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.users[0]);
      result.current.setEditField('profile', 'CLIENT');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('should delete and go to previous page when current page gets empty', async () => {
    (listUsers as jest.Mock)
      .mockResolvedValueOnce({
        data: [
          {
            id: 'user-1',
            fullName: 'Cliente Teste',
            email: 'cliente@b8one.com',
            profile: 'CLIENT',
            isActive: true,
          },
        ],
        page: 2,
        limit: 8,
        total: 9,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        data: [],
        page: 1,
        limit: 8,
        total: 8,
        totalPages: 1,
      });

    (deleteUserById as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });

    await act(async () => {
      await result.current.deleteUser('user-1');
    });

    expect(deleteUserById).toHaveBeenCalledWith('user-1');
    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  it('should update sort order and reload first page', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateSortOrder('ASC');
    });

    await waitFor(() => {
      expect(listUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'ASC',
        sortBy: 'createdAt',
      });
    });
  });

  it('should update sortBy and reload first page', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.updateSortBy('profile');
    });

    await waitFor(() => {
      expect(listUsers).toHaveBeenLastCalledWith({
        page: 1,
        limit: 8,
        sortOrder: 'DESC',
        sortBy: 'profile',
      });
    });
  });

  it('should import users csv and refresh current list', async () => {
    (importUsersCsv as jest.Mock).mockResolvedValue({
      processedRows: 2,
      createdRows: 1,
      updatedRows: 1,
      skippedRows: 0,
      errors: [],
    });

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const csvFile = new File(
      ['fullName,email,profile,isActive\nNew User,new@b8one.com,CLIENT,true'],
      'users.csv',
      { type: 'text/csv' },
    );
    Object.defineProperty(csvFile, 'text', {
      value: jest.fn().mockResolvedValue(
        'fullName,email,profile,isActive\nNew User,new@b8one.com,CLIENT,true',
      ),
    });

    await act(async () => {
      await result.current.importCsvFile(csvFile);
    });

    expect(importUsersCsv).toHaveBeenCalledTimes(1);
    expect(listUsers).toHaveBeenCalledTimes(2);
  });

  it('should export users csv', async () => {
    (exportUsersCsv as jest.Mock).mockResolvedValue({
      fileName: 'users.csv',
      csvContent: 'fullName,email,profile,isActive',
    });

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.exportCsvFile();
    });

    expect(exportUsersCsv).toHaveBeenCalledTimes(1);
  });

  it('should publish error when list users fails', async () => {
    (listUsers as jest.Mock).mockRejectedValueOnce(new Error('users list failure'));

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'users list failure');
  });

  it('should ignore edit field updates when no active edit form', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setEditField('fullName', 'Sem edição');
    });

    expect(result.current.editForm).toBeNull();
  });

  it('should no-op save and delete when user cannot manage users', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveEdit();
      await result.current.deleteUser('user-1');
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(deleteUserById).not.toHaveBeenCalled();
  });

  it('should no-op save when no editing state exists', async () => {
    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('should publish error when save user fails', async () => {
    (updateUserById as jest.Mock).mockRejectedValueOnce(new Error('save user failure'));

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.startEdit(result.current.users[0]);
      result.current.setEditField('fullName', 'Cliente Atualizado');
      result.current.setEditField('email', 'cliente@b8one.com');
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'save user failure');
  });

  it('should reload current page after delete when page still has items', async () => {
    (deleteUserById as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteUser('user-1');
    });

    expect(deleteUserById).toHaveBeenCalledWith('user-1');
    expect(listUsers).toHaveBeenCalledTimes(2);
  });

  it('should publish error when delete user fails', async () => {
    (deleteUserById as jest.Mock).mockRejectedValueOnce(new Error('delete user failure'));

    const { result } = renderHook(() => useUsersList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteUser('user-1');
    });

    expect(publishMock).toHaveBeenCalledWith('error', 'delete user failure');
  });
});
