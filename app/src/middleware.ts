import { NextResponse, type NextRequest } from 'next/server';
import {
  APP_ROUTES,
  isExamsAdminPath,
  isProtectedPath,
  isUsersPath,
} from '@/utils/route';
import { getAuthSessionFromToken } from '@/utils/auth-token';
import { env } from '@/utils/env';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value ?? null;
  const authSession = getAuthSessionFromToken(token);
  const isAuthenticated = Boolean(authSession);
  const isAdmin = authSession?.user.profile === 'ADMIN';

  if (pathname === '/') {
    const destination = isAuthenticated
      ? isAdmin
        ? APP_ROUTES.users
        : APP_ROUTES.app
      : APP_ROUTES.login;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL(APP_ROUTES.login, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (authSession && pathname === APP_ROUTES.app && isAdmin) {
    return NextResponse.redirect(new URL(APP_ROUTES.users, request.url));
  }

  if (authSession && isUsersPath(pathname) && authSession.user.profile !== 'ADMIN') {
    return NextResponse.redirect(new URL(APP_ROUTES.app, request.url));
  }

  if (authSession && isExamsAdminPath(pathname) && authSession.user.profile !== 'ADMIN') {
    return NextResponse.redirect(new URL(APP_ROUTES.app, request.url));
  }

  if (pathname === APP_ROUTES.login && isAuthenticated) {
    const destination = isAdmin ? APP_ROUTES.users : APP_ROUTES.app;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/app/:path*'],
};
