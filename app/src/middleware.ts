import { NextResponse, type NextRequest } from 'next/server';
import { APP_ROUTES, isProtectedPath } from '@/utils/route';
import { env } from '@/utils/env';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(env.AUTH_COOKIE_NAME)?.value;

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL(APP_ROUTES.login, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === APP_ROUTES.login && token) {
    return NextResponse.redirect(new URL(APP_ROUTES.exams, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/exams/:path*', '/appointments/:path*'],
};
