/**
 * @jest-environment node
 */
import { getCookie, setCookie } from '@/utils/cookie';

describe('cookie utils (node environment)', () => {
  it('should return null when no document is available', () => {
    expect(getCookie('token')).toBeNull();
  });

  it('should do nothing when trying to set cookie without document', () => {
    expect(() => setCookie('token', 'no-document')).not.toThrow();
  });
});

