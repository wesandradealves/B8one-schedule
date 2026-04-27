import { act, renderHook, waitFor } from '@testing-library/react';
import { useCreateUser } from '@/hooks/useCreateUser';
import { createUser } from '@/services/users.service';

const pushMock = jest.fn();
const publishMock = jest.fn();
const useRolePermissionsMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/hooks/useRolePermissions', () => ({
  useRolePermissions: () => useRolePermissionsMock(),
}));

jest.mock('@/services/users.service', () => ({
  createUser: jest.fn(),
}));

describe('useCreateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRolePermissionsMock.mockReturnValue({
      isAdmin: true,
      canManageExams: true,
      canManageAppointments: true,
      canCancelAppointments: true,
      canManageUsers: true,
    });

    (createUser as jest.Mock).mockResolvedValue({ id: 'user-1' });
  });

  it('submits successfully with normalized payload', async () => {
    const { result } = renderHook(() => useCreateUser());

    act(() => {
      result.current.setField('fullName', '  Novo Usuário  ');
      result.current.setField('email', 'NOVO@B8ONE.COM');
      result.current.setField('password', 'Senha123');
      result.current.setField('confirmPassword', 'Senha123');
      result.current.setField('profile', 'ADMIN');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(createUser).toHaveBeenCalledWith({
      fullName: 'Novo Usuário',
      email: 'novo@b8one.com',
      password: 'Senha123',
      profile: 'ADMIN',
    });
    expect(publishMock).toHaveBeenCalledWith(
      'success',
      'Usuário criado. Um link de confirmação foi enviado para ativação da conta.',
    );
    expect(pushMock).toHaveBeenCalledWith('/app/users');
  });

  it('validates user form before submit', async () => {
    const { result } = renderHook(() => useCreateUser());

    act(() => {
      result.current.setField('fullName', 'A');
      result.current.setField('email', 'invalid-email');
      result.current.setField('password', '123');
      result.current.setField('confirmPassword', '456');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(createUser).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.fullName).toBe('Informe o nome com ao menos 3 caracteres');
    expect(result.current.fieldErrors.email).toBe('Informe um e-mail válido');
    expect(result.current.fieldErrors.password).toBe('A senha deve ter no mínimo 6 caracteres');
    expect(result.current.fieldErrors.confirmPassword).toBe('As senhas não conferem');
  });

  it('blocks submit for non-admin users', async () => {
    useRolePermissionsMock.mockReturnValue({
      isAdmin: false,
      canManageExams: false,
      canManageAppointments: false,
      canCancelAppointments: true,
      canManageUsers: false,
    });

    const { result } = renderHook(() => useCreateUser());

    expect(result.current.canSubmit).toBe(false);

    await act(async () => {
      await result.current.submit();
    });

    expect(createUser).not.toHaveBeenCalled();
    expect(publishMock).toHaveBeenCalledWith('error', 'Acesso restrito ao perfil administrador.');
  });

  it('handles creation request errors', async () => {
    (createUser as jest.Mock).mockRejectedValue(new Error('E-mail already in use'));

    const { result } = renderHook(() => useCreateUser());

    act(() => {
      result.current.setField('fullName', 'Novo Usuário');
      result.current.setField('email', 'novo@b8one.com');
      result.current.setField('password', 'Senha123');
      result.current.setField('confirmPassword', 'Senha123');
    });

    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => {
      expect(result.current.message?.level).toBe('error');
    });
    expect(publishMock).toHaveBeenCalledWith('error', 'E-mail já está em uso.');
  });

  it('navigates back when cancel is called', () => {
    const { result } = renderHook(() => useCreateUser());

    act(() => {
      result.current.cancel();
    });

    expect(pushMock).toHaveBeenCalledWith('/app/users');
  });
});
