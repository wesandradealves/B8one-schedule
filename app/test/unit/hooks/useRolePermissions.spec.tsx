import { renderHook } from '@testing-library/react';
import { useRolePermissions } from '@/hooks/useRolePermissions';

const useAuthMock = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => useAuthMock(),
}));

describe('useRolePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should grant admin permissions for ADMIN profile', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'admin-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
    });

    const { result } = renderHook(() => useRolePermissions());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.canManageExams).toBe(true);
    expect(result.current.canManageAppointments).toBe(true);
    expect(result.current.canCancelAppointments).toBe(true);
    expect(result.current.canManageUsers).toBe(true);
  });

  it('should deny management permissions for non-admin profiles', () => {
    useAuthMock.mockReturnValue({
      user: {
        id: 'client-1',
        email: 'client@b8one.com',
        profile: 'CLIENT',
      },
    });

    const { result } = renderHook(() => useRolePermissions());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.canManageExams).toBe(false);
    expect(result.current.canManageAppointments).toBe(false);
    expect(result.current.canCancelAppointments).toBe(true);
    expect(result.current.canManageUsers).toBe(false);
  });
});
