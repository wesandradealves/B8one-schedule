import { renderHook } from '@testing-library/react';
import { useProtectedNavigation } from '@/hooks/useProtectedNavigation';

const useAuthMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

describe('useProtectedNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include users route only for admin profile', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
    });

    const { result, rerender } = renderHook(() => useProtectedNavigation());
    expect(result.current.some((item) => item.href === '/app/users')).toBe(true);

    useAuthMock.mockReturnValue({
      user: {
        id: 'client-1',
        email: 'client@b8one.com',
        profile: 'CLIENT',
      },
    });

    rerender();
    expect(result.current.some((item) => item.href === '/app/users')).toBe(false);
  });
});
