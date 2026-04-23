import { NextResponse, type NextRequest } from 'next/server';
import { APP_ROUTES, isProtectedPath } from '@/utils/route';
import { env } from '@/utils/env';

interface JwtPayload {
  exp?: number;
  profile?: string;
  sub?: string;
  email?: string;
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(normalized);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

const hasValidSessionToken = (token: string | undefined): boolean => {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  if (!payload?.exp || !payload.sub || !payload.email || !payload.profile) {
    return false;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowInSeconds;
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = hasValidSessionToken(token);

  if (pathname === '/') {
    const destination = isAuthenticated ? APP_ROUTES.app : APP_ROUTES.login;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(APP_ROUTES.login, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === APP_ROUTES.login && isAuthenticated) {
    return NextResponse.redirect(new URL(APP_ROUTES.app, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/app/:path*'],
};
