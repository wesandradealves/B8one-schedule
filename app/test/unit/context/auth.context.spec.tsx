import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '@/context/auth';

const getCookieMock = jest.fn();
const setCookieMock = jest.fn();
const removeCookieMock = jest.fn();

jest.mock('@/utils/cookie', () => ({
  getCookie: (...args: unknown[]) => getCookieMock(...args),
  setCookie: (...args: unknown[]) => setCookieMock(...args),
  removeCookie: (...args: unknown[]) => removeCookieMock(...args),
}));

describe('AuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getCookieMock.mockReturnValue('boot-token');
  });

  it('should bootstrap token from cookie and expose auth state', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).toBe('boot-token');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set and clear session using centralized cookie helpers', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).toBe('boot-token');
    });

    act(() => {
      result.current.setSession('new-token', {
        id: '1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      });
    });

    expect(result.current.token).toBe('new-token');
    expect(result.current.user?.profile).toBe('ADMIN');
    expect(setCookieMock).toHaveBeenCalled();

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(removeCookieMock).toHaveBeenCalledTimes(1);
  });
});
