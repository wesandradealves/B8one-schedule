import { NextResponse, type NextRequest } from 'next/server';
import { APP_ROUTES, isProtectedPath, isUsersPath } from '@/utils/route';
import { getAuthSessionFromToken } from '@/utils/auth-token';
import { env } from '@/utils/env';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value ?? null;
  const authSession = getAuthSessionFromToken(token);
  const isAuthenticated = Boolean(authSession);

  if (pathname === '/') {
    const destination = isAuthenticated ? APP_ROUTES.app : APP_ROUTES.login;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(APP_ROUTES.login, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authSession && isUsersPath(pathname) && authSession.user.profile !== 'ADMIN') {
    return NextResponse.redirect(new URL(APP_ROUTES.app, request.url));
  }

  if (pathname === APP_ROUTES.login && isAuthenticated) {
    return NextResponse.redirect(new URL(APP_ROUTES.app, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/app/:path*'],
};
