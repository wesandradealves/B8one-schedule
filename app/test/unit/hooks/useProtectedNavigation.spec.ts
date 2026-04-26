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

  it('should build admin and client navigation according to profile', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
    });

    const { result, rerender } = renderHook(() => useProtectedNavigation());
    expect(result.current).toEqual([
      { label: 'Usuários', href: '/app/users', icon: 'users' },
      { label: 'Exames', href: '/app/exams', icon: 'exams' },
      { label: 'Agendamentos', href: '/app/appointments', icon: 'appointments' },
    ]);
    expect(result.current.some((item) => item.href === '/app')).toBe(false);

    useAuthMock.mockReturnValue({
      user: {
        id: 'client-1',
        email: 'client@b8one.com',
        profile: 'CLIENT',
      },
    });

    rerender();
    expect(result.current).toEqual([
      { label: 'Início', href: '/app', icon: 'home' },
      { label: 'Agendamentos', href: '/app/appointments', icon: 'appointments' },
    ]);
  });
});
