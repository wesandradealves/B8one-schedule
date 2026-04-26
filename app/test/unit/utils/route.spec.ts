import {
  APP_ROUTES,
  isAppRoute,
  isExamsAdminPath,
  isExamsListPath,
  isProtectedPath,
  isUsersPath,
  PROTECTED_ROUTE_PREFIXES,
  resolvePostLoginRoute,
} from '@/utils/route';

describe('route utils', () => {
  it('should expose the expected app route prefixes', () => {
    expect(APP_ROUTES.app).toBe('/app');
    expect(APP_ROUTES.login).toBe('/login');
    expect(APP_ROUTES.confirmEmail).toBe('/confirm-email');
    expect(APP_ROUTES.exams).toBe('/app/exams');
    expect(APP_ROUTES.examsCreate).toBe('/app/exams/new');
    expect(APP_ROUTES.appointments).toBe('/app/appointments');
    expect(APP_ROUTES.users).toBe('/app/users');
    expect(APP_ROUTES.usersCreate).toBe('/app/users/new');
    expect(APP_ROUTES.myAccount).toBe('/app/my-account');
    expect(PROTECTED_ROUTE_PREFIXES).toEqual(['/app']);
  });

  it('should build dynamic exam details route', () => {
    expect(APP_ROUTES.examDetails('abc')).toBe('/app/exams/abc');
  });

  it('should identify protected and public paths correctly', () => {
    expect(isProtectedPath('/app')).toBe(true);
    expect(isProtectedPath('/app/exams')).toBe(true);
    expect(isProtectedPath('/app/exams/123')).toBe(true);
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/')).toBe(false);
  });

  it('should identify users admin route paths', () => {
    expect(isUsersPath('/app/users')).toBe(true);
    expect(isUsersPath('/app/users/new')).toBe(true);
    expect(isUsersPath('/app/users/123')).toBe(true);
    expect(isUsersPath('/app/exams')).toBe(false);
  });

  it('should identify exams list route only for exact path', () => {
    expect(isExamsListPath('/app/exams')).toBe(true);
    expect(isExamsListPath('/app/exams/123')).toBe(false);
    expect(isExamsListPath('/app')).toBe(false);
  });

  it('should identify exams admin-only paths', () => {
    expect(isExamsAdminPath('/app/exams')).toBe(true);
    expect(isExamsAdminPath('/app/exams/new')).toBe(true);
    expect(isExamsAdminPath('/app/exams/123')).toBe(false);
  });

  it('should validate app routes for safe post-login redirects', () => {
    expect(isAppRoute('/app')).toBe(true);
    expect(isAppRoute('/app/exams')).toBe(true);
    expect(isAppRoute('/login')).toBe(false);
    expect(isAppRoute('https://malicious.example')).toBe(false);
    expect(isAppRoute('//malicious.example')).toBe(false);
  });

  it('should resolve post-login route to app default when invalid', () => {
    expect(resolvePostLoginRoute('/app/exams')).toBe('/app/exams');
    expect(resolvePostLoginRoute('/login')).toBe('/app');
    expect(resolvePostLoginRoute('https://malicious.example')).toBe('/app');
    expect(resolvePostLoginRoute(null)).toBe('/app');
  });
});
