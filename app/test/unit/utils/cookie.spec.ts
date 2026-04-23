import { getCookie, parseCookieHeader, removeCookie, setCookie } from '@/utils/cookie';

describe('cookie utils', () => {
  beforeEach(() => {
    document.cookie = 'token=; Max-Age=0; Path=/';
    document.cookie = 'name=; Max-Age=0; Path=/';
  });

  it('should parse cookie header and decode values', () => {
    const parsed = parseCookieHeader('token=abc123; name=John%20Doe');
    expect(parsed).toEqual({
      token: 'abc123',
      name: 'John Doe',
    });
  });

  it('should ignore malformed cookie chunks without "="', () => {
    const parsed = parseCookieHeader('token=abc123; malformed; role=admin');
    expect(parsed).toEqual({
      token: 'abc123',
      role: 'admin',
    });
  });

  it('should read cookies from explicit cookie header', () => {
    const value = getCookie('token', 'token=xyz; another=value');
    expect(value).toBe('xyz');
  });

  it('should return null when key does not exist in explicit cookie header', () => {
    expect(getCookie('missing', 'token=xyz; another=value')).toBeNull();
  });

  it('should set and get cookies in browser environment', () => {
    setCookie('token', 'secure-value', {
      path: '/',
      sameSite: 'Lax',
      maxAgeSeconds: 60,
    });

    expect(getCookie('token')).toBe('secure-value');
  });

  it('should remove cookies', () => {
    setCookie('token', 'to-remove');
    expect(getCookie('token')).toBe('to-remove');

    removeCookie('token');
    expect(getCookie('token')).toBeNull();
  });

  it('should append secure attribute when configured', () => {
    expect(() =>
      setCookie('token', 'secure-value', {
        secure: true,
        sameSite: 'Lax',
        path: '/',
      }),
    ).not.toThrow();
  });
});
