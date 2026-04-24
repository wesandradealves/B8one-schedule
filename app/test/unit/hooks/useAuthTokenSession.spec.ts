import { renderHook } from '@testing-library/react';
import { useAuthTokenSession } from '@/hooks/useAuthTokenSession';

describe('useAuthTokenSession', () => {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  const createAccessToken = (payload: Record<string, unknown>) => {
    return `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
  };

  it('should return parsed session for valid token', () => {
    const token = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: nowInSeconds + 60,
    });

    const { result } = renderHook(() => useAuthTokenSession(token));

    expect(result.current).toEqual({
      user: {
        id: 'user-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
      exp: nowInSeconds + 60,
    });
  });

  it('should return null for invalid token', () => {
    const { result } = renderHook(() => useAuthTokenSession('invalid-token'));
    expect(result.current).toBeNull();
  });
});
