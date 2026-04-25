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
    const defaultItems: ProtectedNavigationItem[] = [
      { label: 'Início', href: APP_ROUTES.app, icon: 'home' },
      { label: 'Agendamentos', href: APP_ROUTES.appointments, icon: 'appointments' },
    ];

    if (user?.profile === 'ADMIN') {
      defaultItems.splice(1, 0, {
        label: 'Exames',
        href: APP_ROUTES.exams,
        icon: 'exams',
      });
      defaultItems.push({
        label: 'Usuários',
        href: APP_ROUTES.users,
        icon: 'users',
      });
    }

    return defaultItems;
  }, [user?.profile]);
};
