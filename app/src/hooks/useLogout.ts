'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES } from '@/utils/route';

export const useLogout = () => {
  const router = useRouter();
  const { clearSession } = useAuth();

  return useCallback(() => {
    clearSession();
    router.replace(APP_ROUTES.login);
  }, [clearSession, router]);
};
