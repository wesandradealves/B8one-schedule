'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserDisplayName, getUserInitials } from '@/utils/user-display';

export const useUserDisplay = () => {
  const { user } = useAuth();

  return useMemo(() => {
    return {
      user,
      displayName: getUserDisplayName(user),
      initials: getUserInitials(user),
    };
  }, [user]);
};
