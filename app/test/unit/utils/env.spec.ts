describe('env utils', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.NEXT_PUBLIC_APP_NAME;
    delete process.env.NEXT_PUBLIC_APP_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_TIMEOUT_MS;
    delete process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('should use defaults when vars are not defined', () => {
    let loadedEnv: typeof import('@/utils/env').env | undefined;
    jest.isolateModules(() => {
      loadedEnv = require('@/utils/env').env;
    });

    expect(loadedEnv).toMatchObject({
      APP_NAME: 'Agendamentos',
      APP_BASE_URL: 'http://localhost:3001',
      API_BASE_URL: 'http://localhost:3000',
      API_TIMEOUT_MS: 120000,
      AUTH_COOKIE_NAME: 'access_token',
    });
  });

  it('should parse numeric timeout and keep positive fallback behavior', () => {
    process.env.NEXT_PUBLIC_API_TIMEOUT_MS = '4500';
    let loadedEnv: typeof import('@/utils/env').env | undefined;
    jest.isolateModules(() => {
      loadedEnv = require('@/utils/env').env;
    });

    expect(loadedEnv?.API_TIMEOUT_MS).toBe(4500);

    process.env.NEXT_PUBLIC_API_TIMEOUT_MS = '-10';
    jest.resetModules();
    jest.isolateModules(() => {
      loadedEnv = require('@/utils/env').env;
    });

    expect(loadedEnv?.API_TIMEOUT_MS).toBe(120000);
  });
});
