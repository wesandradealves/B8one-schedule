'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '@/types/auth';
import { getCookie, removeCookie, setCookie } from '@/utils/cookie';
import { env } from '@/utils/env';
import { getAuthSessionFromToken } from '@/utils/auth-token';
import { useAuthTokenSession } from '@/hooks/useAuthTokenSession';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const authSession = useAuthTokenSession(token);
  const user = authSession?.user ?? null;

  const clearSession = useCallback(() => {
    setToken(null);
    removeCookie(env.AUTH_COOKIE_NAME);
  }, []);

  useEffect(() => {
    const tokenFromCookie = getCookie(env.AUTH_COOKIE_NAME);
    const sessionFromCookie = getAuthSessionFromToken(tokenFromCookie);

    if (!sessionFromCookie) {
      clearSession();
      return;
    }

    setToken(tokenFromCookie);
  }, [clearSession]);

  const setSession = useCallback(
    (nextToken: string) => {
      const session = getAuthSessionFromToken(nextToken);
      if (!session) {
        clearSession();
        return;
      }

      setToken(nextToken);
      setCookie(env.AUTH_COOKIE_NAME, nextToken, {
        path: '/',
        sameSite: 'Lax',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      });
    },
    [clearSession],
  );

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      user,
      isAuthenticated: Boolean(authSession),
      setSession,
      clearSession,
    };
  }, [authSession, clearSession, setSession, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
