import { act, renderHook, waitFor } from '@testing-library/react';
import { useUsersList } from '@/hooks/useUsersList';
import { deleteUserById, listUsers, updateUserById } from '@/services/users.service';

const useAuthMock = jest.fn();
const useRolePermissionsMock = jest.fn();
const publishMock = jest.fn();

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

jest.mock('@/services/users.service', () => ({
  listUsers: jest.fn(),
  updateUserById: jest.fn(),
  deleteUserById: jest.fn(),
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

    expect(listUsers).toHaveBeenCalledWith({ page: 1, limit: 8, sortOrder: 'DESC' });
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
      result.current.setEditField('profile', 'ADMIN');
      result.current.setEditField('isActive', false);
    });

    await act(async () => {
      await result.current.saveEdit();
    });

    expect(updateUserById).toHaveBeenCalledWith('user-1', {
      fullName: 'Cliente Atualizado',
      profile: 'ADMIN',
      isActive: false,
    });
    expect(publishMock).toHaveBeenCalledWith('success', 'Usuário atualizado com sucesso.');
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
      });
    });
  });
});
