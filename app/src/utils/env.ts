const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeAppName = (value: string | undefined, fallback: string): string => {
  const baseValue = value?.trim() || fallback;
  const withoutBrandPrefix = baseValue.replace(/^b8one[\s:-]*/i, '').trim();
  return withoutBrandPrefix || baseValue;
};

export const env = {
  APP_NAME: normalizeAppName(process.env.NEXT_PUBLIC_APP_NAME, 'Agendamentos'),
  APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL ?? 'http://localhost:3001',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
  API_TIMEOUT_MS: toPositiveNumber(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 120000),
  AUTH_COOKIE_NAME: process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME ?? 'access_token',
} as const;
