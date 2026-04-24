import { fireEvent, render, screen, within } from '@testing-library/react';
import { UsersListSection } from '@/components/organisms/protected/users-list-section';

const useUsersListMock = jest.fn();

jest.mock('@/hooks/useUsersList', () => ({
  useUsersList: () => useUsersListMock(),
}));

describe('UsersListSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render restricted card for non-admin users', () => {
    useUsersListMock.mockReturnValue({
      users: [],
      page: 1,
      total: 0,
      totalPages: 0,
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageUsers: false,
      editingUserId: null,
      editForm: null,
      authenticatedUserId: null,
      setPage: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteUser: jest.fn(),
    });

    render(<UsersListSection />);

    expect(screen.getByText('Acesso restrito ao perfil administrador.')).toBeInTheDocument();
  });

  it('should render admin list and action callbacks', () => {
    const startEdit = jest.fn();
    const deleteUser = jest.fn();

    useUsersListMock.mockReturnValue({
      users: [
        {
          id: 'user-1',
          fullName: 'Administrador',
          email: 'admin@b8one.com',
          profile: 'ADMIN',
          isActive: true,
        },
        {
          id: 'user-2',
          fullName: 'Cliente',
          email: 'cliente@b8one.com',
          profile: 'CLIENT',
          isActive: true,
        },
      ],
      page: 1,
      total: 2,
      totalPages: 1,
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageUsers: true,
      editingUserId: null,
      editForm: null,
      authenticatedUserId: 'user-1',
      setPage: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit,
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteUser,
    });

    render(<UsersListSection />);

    const editButtons = screen.getAllByRole('button', { name: 'Editar' });
    fireEvent.click(editButtons[1]);
    expect(startEdit).toHaveBeenCalled();

    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir' });
    expect(deleteButtons[0]).toBeDisabled();

    fireEvent.click(deleteButtons[1]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Confirmar desativação')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Desativar' }));
    expect(deleteUser).toHaveBeenCalledWith('user-2');
  });

  it('should close user confirmation dialog on cancel', () => {
    useUsersListMock.mockReturnValue({
      users: [
        {
          id: 'user-1',
          fullName: 'Administrador',
          email: 'admin@b8one.com',
          profile: 'ADMIN',
          isActive: true,
        },
        {
          id: 'user-2',
          fullName: 'Cliente',
          email: 'cliente@b8one.com',
          profile: 'CLIENT',
          isActive: true,
        },
      ],
      page: 1,
      total: 2,
      totalPages: 1,
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageUsers: true,
      editingUserId: null,
      editForm: null,
      authenticatedUserId: 'user-1',
      setPage: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteUser: jest.fn(),
    });

    render(<UsersListSection />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Excluir' });
    fireEvent.click(deleteButtons[1]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render edit mode controls', () => {
    const saveEdit = jest.fn();
    const cancelEdit = jest.fn();

    useUsersListMock.mockReturnValue({
      users: [
        {
          id: 'user-1',
          fullName: 'Administrador',
          email: 'admin@b8one.com',
          profile: 'ADMIN',
          isActive: true,
        },
      ],
      page: 1,
      total: 1,
      totalPages: 1,
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageUsers: true,
      editingUserId: 'user-1',
      editForm: {
        fullName: 'Administrador Atualizado',
        profile: 'ADMIN',
        isActive: true,
      },
      authenticatedUserId: 'user-1',
      setPage: jest.fn(),
      updateSortOrder: jest.fn(),
      startEdit: jest.fn(),
      cancelEdit,
      setEditField: jest.fn(),
      saveEdit,
      deleteUser: jest.fn(),
    });

    render(<UsersListSection />);

    expect(screen.getByLabelText('Nome do usuário')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(saveEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(cancelEdit).toHaveBeenCalledTimes(1);
  });

  it('should dispatch sort changes', () => {
    const updateSortOrder = jest.fn();

    useUsersListMock.mockReturnValue({
      users: [],
      page: 1,
      total: 0,
      totalPages: 0,
      sortOrder: 'DESC',
      isLoading: false,
      isSaving: false,
      canManageUsers: true,
      editingUserId: null,
      editForm: null,
      authenticatedUserId: 'admin-1',
      setPage: jest.fn(),
      updateSortOrder,
      startEdit: jest.fn(),
      cancelEdit: jest.fn(),
      setEditField: jest.fn(),
      saveEdit: jest.fn(),
      deleteUser: jest.fn(),
    });

    render(<UsersListSection />);

    fireEvent.change(screen.getByLabelText('Ordenar'), {
      target: { value: 'ASC' },
    });

    expect(updateSortOrder).toHaveBeenCalledWith('ASC');
  });
});
