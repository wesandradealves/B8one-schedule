import { act, renderHook } from '@testing-library/react';
import { useLogout } from '@/hooks/useLogout';
import { APP_ROUTES } from '@/utils/route';

const replaceMock = jest.fn();
const clearSessionMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    clearSession: clearSessionMock,
  }),
}));

describe('useLogout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clear auth session and redirect to login route', () => {
    const { result } = renderHook(() => useLogout());

    act(() => {
      result.current();
    });

    expect(clearSessionMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith(APP_ROUTES.login);
  });
});
