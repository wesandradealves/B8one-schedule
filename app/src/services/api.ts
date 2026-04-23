import axios from 'axios';
import { env } from '@/utils/env';
import { getCookie } from '@/utils/cookie';

export interface ApiInterceptorsBindings {
  onRequestStart: () => void;
  onRequestEnd: () => void;
  onUnauthorized?: () => void;
  getToken?: () => string | null;
}

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: env.API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

const resolveToken = (getToken?: () => string | null): string | null => {
  return getToken?.() ?? getCookie(env.AUTH_COOKIE_NAME);
};

export const setupApiInterceptors = ({
  onRequestStart,
  onRequestEnd,
  onUnauthorized,
  getToken,
}: ApiInterceptorsBindings): (() => void) => {
  if (requestInterceptorId !== null) {
    api.interceptors.request.eject(requestInterceptorId);
  }

  if (responseInterceptorId !== null) {
    api.interceptors.response.eject(responseInterceptorId);
  }

  requestInterceptorId = api.interceptors.request.use(
    (config) => {
      onRequestStart();

      const token = resolveToken(getToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      onRequestEnd();
      return Promise.reject(error);
    },
  );

  responseInterceptorId = api.interceptors.response.use(
    (response) => {
      onRequestEnd();
      return response;
    },
    (error) => {
      onRequestEnd();

      if (error?.response?.status === 401) {
        onUnauthorized?.();
      }

      return Promise.reject(error);
    },
  );

  return () => {
    if (requestInterceptorId !== null) {
      api.interceptors.request.eject(requestInterceptorId);
      requestInterceptorId = null;
    }

    if (responseInterceptorId !== null) {
      api.interceptors.response.eject(responseInterceptorId);
      responseInterceptorId = null;
    }
  };
};

export default api;
