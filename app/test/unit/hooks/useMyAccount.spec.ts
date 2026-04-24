import { act, renderHook, waitFor } from '@testing-library/react';
import { useMyAccount } from '@/hooks/useMyAccount';
import { getUserById, updateUserById } from '@/services/users.service';

const useAuthMock = jest.fn();
const publishMock = jest.fn();
const logoutMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
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
  getUserById: jest.fn(),
  updateUserById: jest.fn(),
}));

describe('useMyAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logoutMock.mockReset();
    useAuthMock.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'cliente@b8one.com',
        profile: 'CLIENT',
      },
    });
    (getUserById as jest.Mock).mockResolvedValue({
      id: 'user-1',
      fullName: 'Cliente Teste',
      email: 'cliente@b8one.com',
      profile: 'CLIENT',
      isActive: true,
    });
  });

  it('should load current user data on mount', async () => {
    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getUserById).toHaveBeenCalledWith('user-1');
    expect(result.current.form.fullName).toBe('Cliente Teste');
    expect(result.current.form.email).toBe('cliente@b8one.com');
    expect(result.current.canSubmit).toBe(false);
  });

  it('should keep email fallback and stop loading when session has no user id', async () => {
    useAuthMock.mockReturnValue({
      user: {
        id: '',
        email: 'fallback@b8one.com',
        profile: 'CLIENT',
      },
    });

    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getUserById).not.toHaveBeenCalled();
    expect(result.current.form.email).toBe('fallback@b8one.com');
    expect(result.current.canSubmit).toBe(false);
  });

  it('should validate password constraints before submitting', async () => {
    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setField('password', '123');
      result.current.setField('confirmPassword', '321');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.password).toBeDefined();
    expect(result.current.fieldErrors.confirmPassword).toBeDefined();
  });

  it('should show validation when confirming password without filling password', async () => {
    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setField('confirmPassword', 'NovaSenha123');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.confirmPassword).toBe(
      'Informe uma nova senha antes de confirmar',
    );
  });

  it('should require password confirmation when password is informed', async () => {
    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setField('password', 'NovaSenha123');
      result.current.setField('confirmPassword', '');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(result.current.fieldErrors.confirmPassword).toBe('Confirme a nova senha');
  });

  it('should submit password changes successfully and force logout', async () => {
    (updateUserById as jest.Mock).mockResolvedValue({
      id: 'user-1',
      fullName: 'Cliente Teste',
      email: 'cliente@b8one.com',
      profile: 'CLIENT',
      isActive: true,
    });

    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setField('password', 'NovaSenha123');
      result.current.setField('confirmPassword', 'NovaSenha123');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(updateUserById).toHaveBeenCalledWith('user-1', {
      password: 'NovaSenha123',
    });
    expect(publishMock).toHaveBeenCalledWith(
      'success',
      'Senha atualizada com sucesso. Faça login novamente.',
    );
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('should return info message when there is no change to save', async () => {
    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(updateUserById).not.toHaveBeenCalled();
    expect(result.current.message).toEqual({
      level: 'info',
      text: 'Nenhuma alteração para salvar.',
    });
  });

  it('should report error when update request fails', async () => {
    (updateUserById as jest.Mock).mockRejectedValue(new Error('Erro ao atualizar perfil'));

    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setField('password', 'NovaSenha123');
      result.current.setField('confirmPassword', 'NovaSenha123');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.message).toEqual({
      level: 'error',
      text: 'Erro ao atualizar perfil',
    });
    expect(publishMock).toHaveBeenCalledWith('error', 'Erro ao atualizar perfil');
  });

  it('should report loading error when fetching current user fails', async () => {
    (getUserById as jest.Mock).mockRejectedValue(new Error('Erro ao carregar perfil'));

    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.message).toEqual({
      level: 'error',
      text: 'Erro ao carregar perfil',
    });
    expect(publishMock).toHaveBeenCalledWith('error', 'Erro ao carregar perfil');
  });

  it('should avoid state updates after unmount during profile fetch', async () => {
    let resolvePromise: ((value: unknown) => void) | null = null;
    (getUserById as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { unmount } = renderHook(() => useMyAccount());
    unmount();

    await act(async () => {
      resolvePromise?.({
        id: 'user-1',
        fullName: 'Cliente Teste',
        email: 'cliente@b8one.com',
        profile: 'CLIENT',
        isActive: true,
      });
      await Promise.resolve();
    });

    expect(publishMock).not.toHaveBeenCalled();
  });

  it('should reject submit when session is invalid', async () => {
    useAuthMock.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useMyAccount());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.message).toEqual({
      level: 'error',
      text: 'Sessão inválida. Faça login novamente.',
    });
    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Sessão inválida. Faça login novamente.',
    );
  });
});
