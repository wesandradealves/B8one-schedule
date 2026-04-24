import { renderHook } from '@testing-library/react';
import { useUserDisplay } from '@/hooks/useUserDisplay';

const useAuthMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

describe('useUserDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should derive display name and initials from authenticated user', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'cortney.reichel43@ethereal.email',
        profile: 'CLIENT',
      },
    });

    const { result } = renderHook(() => useUserDisplay());

    expect(result.current.displayName).toBe('Cortney Reichel43');
    expect(result.current.initials).toBe('CR');
  });

  it('should use fallback display for missing user', () => {
    useAuthMock.mockReturnValue({ user: null });

    const { result } = renderHook(() => useUserDisplay());

    expect(result.current.displayName).toBe('Minha conta');
    expect(result.current.initials).toBe('');
  });
});
