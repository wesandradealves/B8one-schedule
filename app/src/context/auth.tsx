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

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user?: AuthUser | null) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const tokenFromCookie = getCookie(env.AUTH_COOKIE_NAME);
    setToken(tokenFromCookie);
  }, []);

  const setSession = useCallback((nextToken: string, nextUser?: AuthUser | null) => {
    setToken(nextToken);
    setUser(nextUser ?? null);

    setCookie(env.AUTH_COOKIE_NAME, nextToken, {
      path: '/',
      sameSite: 'Lax',
      secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
    });
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    removeCookie(env.AUTH_COOKIE_NAME);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      user,
      isAuthenticated: Boolean(token),
      setSession,
      clearSession,
    };
  }, [clearSession, setSession, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
