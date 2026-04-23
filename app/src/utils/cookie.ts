export interface CookieOptions {
  path?: string;
  maxAgeSeconds?: number;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export const parseCookieHeader = (cookieHeader: string): Record<string, string> => {
  return cookieHeader
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, chunk) => {
      const separatorIndex = chunk.indexOf('=');
      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = decodeURIComponent(chunk.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(chunk.slice(separatorIndex + 1).trim());
      accumulator[key] = value;
      return accumulator;
    }, {});
};

export const getCookie = (name: string, cookieHeader?: string): string | null => {
  if (cookieHeader) {
    return parseCookieHeader(cookieHeader)[name] ?? null;
  }

  if (typeof document === 'undefined') {
    return null;
  }

  return parseCookieHeader(document.cookie)[name] ?? null;
};

export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  parts.push(`Path=${options.path ?? '/'}`);

  if (options.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (options.secure) {
    parts.push('Secure');
  }

  document.cookie = parts.join('; ');
};

export const removeCookie = (name: string, path = '/'): void => {
  setCookie(name, '', { path, maxAgeSeconds: 0 });
};
