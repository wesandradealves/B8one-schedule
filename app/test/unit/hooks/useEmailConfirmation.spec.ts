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
});
