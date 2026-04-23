import axios from 'axios';

export const buildQueryString = (
  params: Record<string, string | number | boolean | undefined>,
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString.length > 0 ? `?${queryString}` : '';
};

export const getRequestErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected request error';
};
