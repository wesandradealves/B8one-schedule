import type { AxiosResponse } from 'axios';
import { buildQueryString, executeRequest, getRequestErrorMessage } from '@/utils/request';

describe('request utils', () => {
  it('should build query string ignoring undefined values', () => {
    const query = buildQueryString({
      page: 2,
      limit: 10,
      active: true,
      search: undefined,
    });

    expect(query).toBe('?page=2&limit=10&active=true');
  });

  it('should return empty query string when no params are provided', () => {
    expect(buildQueryString({})).toBe('');
  });

  it('should extract message from axios-like response payload', () => {
    const error = {
      isAxiosError: true,
      message: 'fallback message',
      response: {
        data: {
          message: 'custom message',
        },
      },
    };

    expect(getRequestErrorMessage(error)).toBe('custom message');
  });

  it('should fallback to axios error message when payload message is unavailable', () => {
    const error = {
      isAxiosError: true,
      message: 'fallback message',
      response: {
        data: {},
      },
    };

    expect(getRequestErrorMessage(error)).toBe('fallback message');
  });

  it('should extract message from native Error instances', () => {
    expect(getRequestErrorMessage(new Error('native failure'))).toBe('native failure');
  });

  it('should fallback to generic error message for unknown values', () => {
    expect(getRequestErrorMessage('oops')).toBe('Erro inesperado na requisição.');
  });

  it('should return response data when request succeeds', async () => {
    const response = { data: { ok: true } } as AxiosResponse<{ ok: boolean }>;
    const result = await executeRequest(async () => response);
    expect(result).toEqual({ ok: true });
  });

  it('should throw normalized error when request fails', async () => {
    await expect(
      executeRequest(async () => {
        throw {
          isAxiosError: true,
          message: 'network error',
          response: { data: { message: 'unauthorized' } },
        };
      }),
    ).rejects.toThrow('unauthorized');
  });

  it('should translate known backend messages to Portuguese', () => {
    const error = {
      isAxiosError: true,
      message: 'fallback message',
      response: {
        data: {
          message: 'Exam not found',
        },
      },
    };

    expect(getRequestErrorMessage(error)).toBe('Exame não encontrado.');
  });
});
