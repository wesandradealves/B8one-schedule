'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface RolePermissions {
  isAdmin: boolean;
  canManageExams: boolean;
  canManageAppointments: boolean;
  canCancelAppointments: boolean;
  canManageUsers: boolean;
}

export const useRolePermissions = (): RolePermissions => {
  const { user } = useAuth();

  return useMemo(() => {
    const isAdmin = user?.profile === 'ADMIN';

    return {
      isAdmin,
      canManageExams: isAdmin,
      canManageAppointments: isAdmin,
      canCancelAppointments: Boolean(user),
      canManageUsers: isAdmin,
    };
  }, [user]);
};
