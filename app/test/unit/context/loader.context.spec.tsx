import { act, renderHook } from '@testing-library/react';
import { LoaderProvider, useLoaderContext } from '@/context/loader';

describe('LoaderContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <LoaderProvider>{children}</LoaderProvider>;
  };

  it('should increment and decrement pending requests consistently', () => {
    const { result } = renderHook(() => useLoaderContext(), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.pendingRequests).toBe(0);

    act(() => {
      result.current.startLoading();
      result.current.startLoading();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.pendingRequests).toBe(2);

    act(() => {
      result.current.stopLoading();
      result.current.stopLoading();
      result.current.stopLoading();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.pendingRequests).toBe(0);
  });

  it('should allow forcing loading state', () => {
    const { result } = renderHook(() => useLoaderContext(), { wrapper });

    act(() => {
      result.current.setLoading(true);
    });
    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('should throw when hook is used outside provider', () => {
    expect(() => renderHook(() => useLoaderContext())).toThrow(
      'useLoaderContext must be used within LoaderProvider',
    );
  });
});
