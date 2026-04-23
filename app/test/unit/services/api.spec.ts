import { api, setupApiInterceptors } from '@/services/api';

describe('api service', () => {
  it('should register request/response interceptors and bind callbacks', async () => {
    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();
    const onUnauthorized = jest.fn();

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      onUnauthorized,
      getToken: () => 'access-token',
    });

    const requestHandlers = (api.interceptors.request as any).handlers;
    const responseHandlers = (api.interceptors.response as any).handlers;
    const requestHandler = requestHandlers[requestHandlers.length - 1];
    const responseHandler = responseHandlers[responseHandlers.length - 1];

    const config = await requestHandler.fulfilled({ headers: {} });
    expect(onRequestStart).toHaveBeenCalledTimes(1);
    expect(config.headers.Authorization).toBe('Bearer access-token');

    await responseHandler.fulfilled({ data: { ok: true } });
    expect(onRequestEnd).toHaveBeenCalledTimes(1);

    await expect(responseHandler.rejected({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });
    expect(onRequestEnd).toHaveBeenCalledTimes(2);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    teardown();
  });

  it('should call onRequestEnd when request interceptor rejects', async () => {
    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      getToken: () => null,
    });

    const requestHandlers = (api.interceptors.request as any).handlers;
    const requestHandler = requestHandlers[requestHandlers.length - 1];

    await expect(requestHandler.rejected({ message: 'fail' })).rejects.toEqual({
      message: 'fail',
    });

    expect(onRequestEnd).toHaveBeenCalledTimes(1);
    teardown();
  });
});
