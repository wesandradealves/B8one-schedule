import { APP_ROUTES, isProtectedPath, PROTECTED_ROUTE_PREFIXES } from '@/utils/route';

describe('route utils', () => {
  it('should expose the expected app route prefixes', () => {
    expect(APP_ROUTES.app).toBe('/app');
    expect(APP_ROUTES.login).toBe('/login');
    expect(APP_ROUTES.exams).toBe('/app/exams');
    expect(APP_ROUTES.appointments).toBe('/app/appointments');
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
});
