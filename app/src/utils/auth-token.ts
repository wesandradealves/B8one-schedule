import type { AuthUser, UserProfile } from '@/types/auth';

interface JwtPayload {
  exp?: unknown;
  profile?: unknown;
  sub?: unknown;
  email?: unknown;
}

export interface AuthSession {
  user: AuthUser;
  exp: number;
}

const decodeBase64Url = (value: string): string | null => {
  if (typeof atob !== 'function') {
    return null;
  }

  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = normalizedValue.length % 4;
  const paddedValue =
    paddingLength === 0 ? normalizedValue : `${normalizedValue}${'='.repeat(4 - paddingLength)}`;

  try {
    return atob(paddedValue);
  } catch {
    return null;
  }
};

const isSupportedProfile = (profile: unknown): profile is UserProfile => {
  return profile === 'ADMIN' || profile === 'CLIENT';
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const extractUserFromPayload = (payload: JwtPayload): AuthUser | null => {
  const { sub, email, profile } = payload;

  if (typeof sub !== 'string' || typeof email !== 'string' || !isSupportedProfile(profile)) {
    return null;
  }

  return {
    id: sub,
    email,
    profile,
  };
};

const extractExpirationFromPayload = (payload: JwtPayload): number | null => {
  if (typeof payload.exp !== 'number') {
    return null;
  }

  if (!Number.isFinite(payload.exp) || payload.exp <= 0) {
    return null;
  }

  return Math.floor(payload.exp);
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const payloadJson = decodeBase64Url(parts[1]);
  if (!payloadJson) {
    return null;
  }

  try {
    const parsedPayload: unknown = JSON.parse(payloadJson);
    return isRecord(parsedPayload) ? parsedPayload : null;
  } catch {
    return null;
  }
};

export const extractAuthUserFromToken = (token: string | null | undefined): AuthUser | null => {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  return extractUserFromPayload(payload);
};

export const getAuthSessionFromToken = (
  token: string | null | undefined,
  nowInSeconds = Math.floor(Date.now() / 1000),
): AuthSession | null => {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const user = extractUserFromPayload(payload);
  const exp = extractExpirationFromPayload(payload);

  if (!user || exp === null) {
    return null;
  }

  if (exp <= nowInSeconds) {
    return null;
  }

  return {
    user,
    exp,
  };
};

export const hasValidSessionToken = (
  token: string | null | undefined,
  nowInSeconds?: number,
): boolean => {
  return getAuthSessionFromToken(token, nowInSeconds) !== null;
};
