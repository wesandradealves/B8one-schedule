const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? 'B8one Agendamentos',
  APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'http://localhost:3001',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
  API_TIMEOUT_MS: toPositiveNumber(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 120000),
  AUTH_COOKIE_NAME: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? 'access_token',
} as const;
