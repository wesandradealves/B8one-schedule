import {
  decodeJwtPayload,
  extractAuthUserFromToken,
  getAuthSessionFromToken,
  hasValidSessionToken,
} from '@/utils/auth-token';

const createAccessToken = (payload: Record<string, unknown>) => {
  return `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
};

describe('auth-token utils', () => {
  it('should decode payload from a valid jwt', () => {
    const token = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
    });

    expect(decodeJwtPayload(token)).toEqual({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
    });
  });

  it('should return null for invalid token formats', () => {
    expect(decodeJwtPayload('invalid-token')).toBeNull();
    expect(decodeJwtPayload('header.payload')).toBeNull();
    expect(extractAuthUserFromToken('invalid-token')).toBeNull();
    expect(extractAuthUserFromToken(undefined)).toBeNull();
    expect(getAuthSessionFromToken(null)).toBeNull();
  });

  it('should extract auth user only when payload has required fields', () => {
    const validToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
    });
    expect(extractAuthUserFromToken(validToken)).toEqual({
      id: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
    });

    const unsupportedProfileToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'MANAGER',
    });
    expect(extractAuthUserFromToken(unsupportedProfileToken)).toBeNull();
  });

  it('should return null when payload cannot be base64 decoded', () => {
    const originalAtob = globalThis.atob;
    const throwingAtob = jest.fn(() => {
      throw new Error('decode failure');
    });

    Object.defineProperty(globalThis, 'atob', {
      configurable: true,
      value: throwingAtob,
      writable: true,
    });

    expect(decodeJwtPayload('header.payload.signature')).toBeNull();

    Object.defineProperty(globalThis, 'atob', {
      configurable: true,
      value: originalAtob,
      writable: true,
    });
  });

  it('should return null when atob API is not available', () => {
    const originalAtob = globalThis.atob;

    Object.defineProperty(globalThis, 'atob', {
      configurable: true,
      value: undefined,
      writable: true,
    });

    expect(decodeJwtPayload('header.payload.signature')).toBeNull();

    Object.defineProperty(globalThis, 'atob', {
      configurable: true,
      value: originalAtob,
      writable: true,
    });
  });

  it('should validate session token using exp and return parsed session', () => {
    const nowInSeconds = 1_760_000_000;
    const validToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: nowInSeconds + 120,
    });

    expect(hasValidSessionToken(validToken, nowInSeconds)).toBe(true);
    expect(getAuthSessionFromToken(validToken, nowInSeconds)).toEqual({
      exp: nowInSeconds + 120,
      user: {
        id: 'user-1',
        email: 'admin@b8one.com',
        profile: 'ADMIN',
      },
    });

    const expiredToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: nowInSeconds - 1,
    });

    expect(hasValidSessionToken(expiredToken, nowInSeconds)).toBe(false);
    expect(getAuthSessionFromToken(expiredToken, nowInSeconds)).toBeNull();
  });

  it('should reject sessions with invalid exp payload values', () => {
    const nowInSeconds = 1_760_000_000;
    const stringExpToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: '1700000000',
    });
    const nonFiniteExpToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: Infinity,
    });
    const zeroExpToken = createAccessToken({
      sub: 'user-1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: 0,
    });

    expect(getAuthSessionFromToken(stringExpToken, nowInSeconds)).toBeNull();
    expect(getAuthSessionFromToken(nonFiniteExpToken, nowInSeconds)).toBeNull();
    expect(getAuthSessionFromToken(zeroExpToken, nowInSeconds)).toBeNull();
  });
});
