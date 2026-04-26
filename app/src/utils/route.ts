export const APP_ROUTES = {
  app: '/app',
  login: '/login',
  confirmEmail: '/confirm-email',
  exams: '/app/exams',
  examsCreate: '/app/exams/new',
  examDetails: (id: string) => `/app/exams/${id}`,
  appointments: '/app/appointments',
  users: '/app/users',
  usersCreate: '/app/users/new',
  myAccount: '/app/my-account',
} as const;

export const PROTECTED_ROUTE_PREFIXES = [APP_ROUTES.app] as const;

export const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
};

export const isUsersPath = (pathname: string): boolean => {
  return pathname === APP_ROUTES.users || pathname.startsWith(`${APP_ROUTES.users}/`);
};

export const isExamsListPath = (pathname: string): boolean => {
  return pathname === APP_ROUTES.exams;
};

export const isExamsAdminPath = (pathname: string): boolean => {
  return pathname === APP_ROUTES.exams || pathname === APP_ROUTES.examsCreate;
};

export const isAppRoute = (candidate: string | null): candidate is string => {
  if (!candidate) {
    return false;
  }

  if (candidate.includes('://') || candidate.startsWith('//')) {
    return false;
  }

  return candidate === APP_ROUTES.app || candidate.startsWith(`${APP_ROUTES.app}/`);
};

export const resolvePostLoginRoute = (nextRoute: string | null): string => {
  return isAppRoute(nextRoute) ? nextRoute : APP_ROUTES.app;
};
