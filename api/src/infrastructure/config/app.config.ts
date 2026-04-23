import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HTTP_PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default(''),

  DATABASE_HOST: z.string().default('postgres'),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USERNAME: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('b8one'),
  DATABASE_SSL: z
    .string()
    .default('false')
    .transform((value) => value.toLowerCase() === 'true'),

  REDIS_HOST: z.string().default('redis'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL_SECONDS: z.coerce.number().int().positive().default(300),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(16).default('change-me-access-token-secret'),
  JWT_ACCESS_TOKEN_EXPIRES_SECONDS: z.coerce.number().int().positive().default(3600),

  TWO_FA_CODE_EXPIRATION_MINUTES: z.coerce.number().int().positive().default(10),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().default('no-reply@b8one.com'),
});

export type AppEnv = z.infer<typeof envSchema>;

export const getEnv = (): AppEnv => envSchema.parse(process.env);

const AppConfig = () => {
  const env = getEnv();

  return {
    env: env.NODE_ENV,
    application: {
      port: env.HTTP_PORT,
      apiPrefix: env.API_PREFIX,
    },
    database: {
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      name: env.DATABASE_NAME,
      ssl: env.DATABASE_SSL,
    },
    redis: {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      ttlSeconds: env.REDIS_TTL_SECONDS,
    },
    auth: {
      jwt: {
        secret: env.JWT_ACCESS_TOKEN_SECRET,
        expiresInSeconds: env.JWT_ACCESS_TOKEN_EXPIRES_SECONDS,
      },
      twoFactor: {
        expirationMinutes: env.TWO_FA_CODE_EXPIRATION_MINUTES,
      },
    },
    email: {
      smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.SMTP_FROM,
      },
    },
  };
};

export type AppConfigType = ReturnType<typeof AppConfig>;
export default AppConfig;
