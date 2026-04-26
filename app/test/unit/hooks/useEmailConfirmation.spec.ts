import { act, renderHook, waitFor } from '@testing-library/react';
import { useEmailConfirmation } from '@/hooks/useEmailConfirmation';
import { verifyEmailConfirmation } from '@/services/auth.service';

const pushMock = jest.fn();
const searchParamGetMock = jest.fn();
const publishMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => ({
    get: searchParamGetMock,
  }),
}));

jest.mock('@/hooks/useFeedback', () => ({
  useFeedback: () => ({
    publish: publishMock,
  }),
}));

jest.mock('@/services/auth.service', () => ({
  verifyEmailConfirmation: jest.fn(),
}));

describe('useEmailConfirmation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set error when token is missing', async () => {
    searchParamGetMock.mockReturnValue(null);

    const { result } = renderHook(() => useEmailConfirmation());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toEqual({
      level: 'error',
      text: 'Link de confirmação inválido ou ausente.',
    });
    expect(verifyEmailConfirmation).not.toHaveBeenCalled();
  });

  it('should confirm e-mail successfully', async () => {
    searchParamGetMock.mockReturnValue('token-123');
    (verifyEmailConfirmation as jest.Mock).mockResolvedValue({
      message: 'E-mail confirmado com sucesso. Conta ativada.',
    });

    const { result } = renderHook(() => useEmailConfirmation());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(verifyEmailConfirmation).toHaveBeenCalledWith({ token: 'token-123' });
    expect(result.current.message).toEqual({
      level: 'success',
      text: 'E-mail confirmado com sucesso. Conta ativada.',
    });
    expect(publishMock).toHaveBeenCalledWith(
      'success',
      'E-mail confirmado com sucesso. Conta ativada.',
    );
  });

  it('should expose translated error on confirmation failure', async () => {
    searchParamGetMock.mockReturnValue('token-456');
    (verifyEmailConfirmation as jest.Mock).mockRejectedValue(
      new Error('Invalid or expired e-mail confirmation link'),
    );

    const { result } = renderHook(() => useEmailConfirmation());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.message).toEqual({
      level: 'error',
      text: 'Link de confirmação inválido ou expirado.',
    });
    expect(publishMock).toHaveBeenCalledWith(
      'error',
      'Link de confirmação inválido ou expirado.',
    );
  });

  it('should navigate to login when goToLogin is called', () => {
    searchParamGetMock.mockReturnValue(null);

    const { result } = renderHook(() => useEmailConfirmation());

    act(() => {
      result.current.goToLogin();
    });

    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('should avoid reprocessing the same token on rerender', async () => {
    searchParamGetMock.mockReturnValue('token-repeat');
    (verifyEmailConfirmation as jest.Mock).mockResolvedValue({
      message: 'ok',
    });

    const { rerender } = renderHook(() => useEmailConfirmation());

    await waitFor(() => {
      expect(verifyEmailConfirmation).toHaveBeenCalledTimes(1);
    });

    rerender();

    await waitFor(() => {
      expect(verifyEmailConfirmation).toHaveBeenCalledTimes(1);
    });
  });

  it('should not publish after unmount when confirmation resolves later', async () => {
    searchParamGetMock.mockReturnValue('token-late-success');
    let resolvePromise: ((value: { message: string }) => void) | null = null;
    (verifyEmailConfirmation as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );

    const { unmount } = renderHook(() => useEmailConfirmation());
    unmount();

    await act(async () => {
      resolvePromise?.({ message: 'late success' });
      await Promise.resolve();
    });

    expect(publishMock).not.toHaveBeenCalled();
  });

  it('should not publish after unmount when confirmation rejects later', async () => {
    searchParamGetMock.mockReturnValue('token-late-error');
    let rejectPromise: ((error: Error) => void) | null = null;
    (verifyEmailConfirmation as jest.Mock).mockImplementation(
      () =>
        new Promise((_, reject) => {
          rejectPromise = reject;
        }),
    );

    const { unmount } = renderHook(() => useEmailConfirmation());
    unmount();

    await act(async () => {
      rejectPromise?.(new Error('late error'));
      await Promise.resolve();
    });

    expect(publishMock).not.toHaveBeenCalled();
  });
});
