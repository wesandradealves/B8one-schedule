'use client';

import { useMemo } from 'react';
import type { ProtectedNavIconName } from '@/components/atoms/protected-nav-icon';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES } from '@/utils/route';

export interface ProtectedNavigationItem {
  label: string;
  href: string;
  icon: ProtectedNavIconName;
}

export const useProtectedNavigation = (): ProtectedNavigationItem[] => {
  const { user } = useAuth();

  return useMemo(() => {
    if (user?.profile === 'ADMIN') {
      return [
        { label: 'Usuários', href: APP_ROUTES.users, icon: 'users' },
        { label: 'Exames', href: APP_ROUTES.exams, icon: 'exams' },
        { label: 'Agendamentos', href: APP_ROUTES.appointments, icon: 'appointments' },
      ];
    }

    return [
      { label: 'Início', href: APP_ROUTES.app, icon: 'home' },
      { label: 'Agendamentos', href: APP_ROUTES.appointments, icon: 'appointments' },
    ];
  }, [user?.profile]);
};
