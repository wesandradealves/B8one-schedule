export const APP_ROUTES = {
  app: '/app',
  login: '/login',
  exams: '/app/exams',
  examDetails: (id: string) => `/app/exams/${id}`,
  appointments: '/app/appointments',
} as const;

export const PROTECTED_ROUTE_PREFIXES = [APP_ROUTES.app] as const;

export const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
};
