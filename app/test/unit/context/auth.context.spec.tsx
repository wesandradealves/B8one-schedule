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
  const baseNowInSeconds = Math.floor(Date.now() / 1000);

  const createAccessToken = (payload: Record<string, unknown>) => {
    return `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <AuthProvider>{children}</AuthProvider>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getCookieMock.mockReturnValue(
      createAccessToken({
        sub: 'boot-user',
        email: 'boot@b8one.com',
        profile: 'CLIENT',
        exp: baseNowInSeconds + 300,
      }),
    );
  });

  it('should bootstrap token from cookie and expose auth state only when token is valid', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).not.toBeNull();
    });

    expect(result.current.user).toEqual({
      id: 'boot-user',
      email: 'boot@b8one.com',
      profile: 'CLIENT',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set and clear session using centralized cookie helpers', async () => {
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).not.toBeNull();
    });

    act(() => {
      result.current.setSession(
        createAccessToken({
          sub: 'admin-1',
          email: 'admin@b8one.com',
          profile: 'ADMIN',
          exp: baseNowInSeconds + 300,
        }),
      );
    });

    expect(result.current.token).not.toBeNull();
    expect(result.current.user?.profile).toBe('ADMIN');
    expect(setCookieMock).toHaveBeenCalled();

    act(() => {
      result.current.setSession('invalid-token');
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(removeCookieMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.clearSession();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(removeCookieMock).toHaveBeenCalledTimes(2);
  });

  it('should derive authenticated user from jwt payload', async () => {
    const tokenFromCookie = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: baseNowInSeconds + 300,
    });
    getCookieMock.mockReturnValue(tokenFromCookie);

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 'user-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      });
    });

    act(() => {
      result.current.setSession(
        createAccessToken({
          sub: 'user-2',
          email: 'client@b8one.com',
          profile: 'CLIENT',
          exp: baseNowInSeconds + 300,
        }),
      );
    });

    expect(result.current.user).toEqual({
      id: 'user-2',
      email: 'client@b8one.com',
      profile: 'CLIENT',
    });
  });

  it('should clear persisted cookie when token is expired', async () => {
    getCookieMock.mockReturnValueOnce(
      createAccessToken({
        sub: 'expired-user',
        email: 'expired@b8one.com',
        profile: 'CLIENT',
        exp: baseNowInSeconds - 1,
      }),
    );

    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.token).toBeNull();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(removeCookieMock).toHaveBeenCalledTimes(1);
  });

  it('should throw when hook is used outside provider', () => {
    expect(() => renderHook(() => useAuthContext())).toThrow(
      'useAuthContext must be used within AuthProvider',
    );
  });
});
