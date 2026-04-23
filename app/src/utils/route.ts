export const APP_ROUTES = {
  login: '/login',
  exams: '/exams',
  examDetails: (id: string) => `/exams/${id}`,
  appointments: '/appointments',
} as const;

export const PROTECTED_ROUTE_PREFIXES = [
  APP_ROUTES.exams,
  APP_ROUTES.appointments,
] as const;

export const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
};
