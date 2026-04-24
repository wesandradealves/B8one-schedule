'use client';

import { useMemo } from 'react';
import {
  getAuthSessionFromToken,
  type AuthSession,
} from '@/utils/auth-token';

export const useAuthTokenSession = (
  token: string | null | undefined,
): AuthSession | null => {
  return useMemo(() => getAuthSessionFromToken(token), [token]);
};
