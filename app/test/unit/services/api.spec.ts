import { api, setupApiInterceptors } from '@/services/api';

describe('api service', () => {
  type RequestFulfilled = NonNullable<Parameters<typeof api.interceptors.request.use>[0]>;
  type RequestRejected = NonNullable<Parameters<typeof api.interceptors.request.use>[1]>;
  type ResponseFulfilled = NonNullable<Parameters<typeof api.interceptors.response.use>[0]>;
  type ResponseRejected = NonNullable<Parameters<typeof api.interceptors.response.use>[1]>;

  const createInterceptorCallbacks = () => {
    let requestFulfilled: RequestFulfilled | null = null;
    let requestRejected: RequestRejected | null = null;
    let responseFulfilled: ResponseFulfilled | null = null;
    let responseRejected: ResponseRejected | null = null;

    const requestUseSpy = jest
      .spyOn(api.interceptors.request, 'use')
      .mockImplementation((onFulfilled, onRejected) => {
        requestFulfilled = onFulfilled ?? null;
        requestRejected = onRejected ?? null;
        return 101;
      });

    const responseUseSpy = jest
      .spyOn(api.interceptors.response, 'use')
      .mockImplementation((onFulfilled, onRejected) => {
        responseFulfilled = onFulfilled ?? null;
        responseRejected = onRejected ?? null;
        return 201;
      });

    const expectCallbacks = () => {
      expect(requestFulfilled).not.toBeNull();
      expect(requestRejected).not.toBeNull();
      expect(responseFulfilled).not.toBeNull();
      expect(responseRejected).not.toBeNull();
    };

    const restore = () => {
      requestUseSpy.mockRestore();
      responseUseSpy.mockRestore();
    };

    return {
      getRequestFulfilled: () => requestFulfilled,
      getRequestRejected: () => requestRejected,
      getResponseFulfilled: () => responseFulfilled,
      getResponseRejected: () => responseRejected,
      expectCallbacks,
      restore,
    };
  };

  it('should register request/response interceptors and bind callbacks', async () => {
    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();
    const onUnauthorized = jest.fn();
    const callbacks = createInterceptorCallbacks();

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      onUnauthorized,
      getToken: () => 'access-token',
    });

    callbacks.expectCallbacks();
    const requestFulfilled = callbacks.getRequestFulfilled() as RequestFulfilled;
    const responseFulfilled = callbacks.getResponseFulfilled() as ResponseFulfilled;
    const responseRejected = callbacks.getResponseRejected() as ResponseRejected;

    const config = (await requestFulfilled({
      headers: {},
    } as Parameters<RequestFulfilled>[0])) as { headers: Record<string, string> };
    expect(onRequestStart).toHaveBeenCalledTimes(1);
    expect(config.headers.Authorization).toBe('Bearer access-token');

    await responseFulfilled({ data: { ok: true } } as Parameters<ResponseFulfilled>[0]);
    expect(onRequestEnd).toHaveBeenCalledTimes(1);

    await expect(responseRejected({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });
    expect(onRequestEnd).toHaveBeenCalledTimes(2);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    teardown();
    callbacks.restore();
  });

  it('should call onRequestEnd when request interceptor rejects', async () => {
    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();
    const callbacks = createInterceptorCallbacks();

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      getToken: () => null,
    });

    callbacks.expectCallbacks();
    const requestRejected = callbacks.getRequestRejected() as RequestRejected;

    await expect(requestRejected({ message: 'fail' })).rejects.toEqual({
      message: 'fail',
    });

    expect(onRequestEnd).toHaveBeenCalledTimes(1);
    teardown();
    callbacks.restore();
  });

  it('should not call onUnauthorized for non-401 responses', async () => {
    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();
    const onUnauthorized = jest.fn();
    const callbacks = createInterceptorCallbacks();

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      onUnauthorized,
      getToken: () => null,
    });

    callbacks.expectCallbacks();
    const responseRejected = callbacks.getResponseRejected() as ResponseRejected;

    await expect(responseRejected({ response: { status: 500 } })).rejects.toEqual({
      response: { status: 500 },
    });

    expect(onUnauthorized).not.toHaveBeenCalled();
    teardown();
    callbacks.restore();
  });

  it('should eject previous interceptors when setup is called again', () => {
    const requestEjectSpy = jest.spyOn(api.interceptors.request, 'eject');
    const responseEjectSpy = jest.spyOn(api.interceptors.response, 'eject');

    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();

    setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      getToken: () => null,
    });

    expect(requestEjectSpy).toHaveBeenCalledTimes(0);
    expect(responseEjectSpy).toHaveBeenCalledTimes(0);

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
      getToken: () => null,
    });

    expect(requestEjectSpy).toHaveBeenCalledTimes(1);
    expect(responseEjectSpy).toHaveBeenCalledTimes(1);

    teardown();
    requestEjectSpy.mockRestore();
    responseEjectSpy.mockRestore();
  });

  it('should fallback to cookie token when getToken is not provided', async () => {
    document.cookie = 'access_token=cookie-token; Path=/';

    const onRequestStart = jest.fn();
    const onRequestEnd = jest.fn();
    const callbacks = createInterceptorCallbacks();

    const teardown = setupApiInterceptors({
      onRequestStart,
      onRequestEnd,
    });

    callbacks.expectCallbacks();
    const requestFulfilled = callbacks.getRequestFulfilled() as RequestFulfilled;

    const config = (await requestFulfilled({
      headers: {},
    } as Parameters<RequestFulfilled>[0])) as { headers: Record<string, string> };
    expect(config.headers.Authorization).toBe('Bearer cookie-token');

    teardown();
    callbacks.restore();
    document.cookie = 'access_token=; Max-Age=0; Path=/';
  });
});
