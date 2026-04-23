/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';
import { middleware, config } from '@/middleware';

const encode = (value: Record<string, unknown>): string => {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
};

const buildToken = (payload: Record<string, unknown>): string => {
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
};

const buildInvalidPayloadToken = (): string => {
  const encodedHeader = encode({ alg: 'HS256', typ: 'JWT' });
  const invalidPayload = Buffer.from('invalid-json-payload').toString('base64url');
  return `${encodedHeader}.${invalidPayload}.signature`;
};

const createRequest = (
  pathname: string,
  options?: {
    search?: string;
    token?: string;
  },
): NextRequest => {
  const search = options?.search ?? '';
  const token = options?.token;

  return {
    url: `http://localhost:3001${pathname}${search}`,
    nextUrl: {
      pathname,
      search,
    },
    cookies: {
      get: () => (token ? { value: token } : undefined),
    },
  } as unknown as NextRequest;
};

describe('middleware', () => {
  it('should keep matcher focused on root, login and app group', () => {
    expect(config.matcher).toEqual(['/', '/login', '/app/:path*']);
  });

  it('should redirect root to login when unauthenticated', () => {
    const response = middleware(createRequest('/'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/login');
  });

  it('should redirect root to app when authenticated', () => {
    const token = buildToken({
      sub: '1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const response = middleware(createRequest('/', { token }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/app');
  });

  it('should redirect protected route to login with next param when unauthenticated', () => {
    const response = middleware(createRequest('/app/exams', { search: '?page=2' }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'http://localhost:3001/login?next=%2Fapp%2Fexams%3Fpage%3D2',
    );
  });

  it('should redirect login to app when authenticated', () => {
    const token = buildToken({
      sub: '1',
      email: 'admin@b8one.com',
      profile: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const response = middleware(createRequest('/login', { token }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/app');
  });

  it('should treat malformed token as unauthenticated', () => {
    const response = middleware(createRequest('/app', { token: 'malformed-token' }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/login?next=%2Fapp');
  });

  it('should treat invalid jwt payload as unauthenticated', () => {
    const response = middleware(createRequest('/app', { token: buildInvalidPayloadToken() }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3001/login?next=%2Fapp');
  });

  it('should continue when route is public and user is unauthenticated', () => {
    const response = middleware(createRequest('/login'));
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});
