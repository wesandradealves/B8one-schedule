'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface LoaderContextValue {
  isLoading: boolean;
  pendingRequests: number;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (loading: boolean) => void;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [pendingRequests, setPendingRequests] = useState(0);

  const startLoading = useCallback(() => {
    setPendingRequests((previous) => previous + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setPendingRequests((previous) => Math.max(previous - 1, 0));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setPendingRequests(loading ? 1 : 0);
  }, []);

  const value = useMemo<LoaderContextValue>(() => {
    return {
      isLoading: pendingRequests > 0,
      pendingRequests,
      startLoading,
      stopLoading,
      setLoading,
    };
  }, [pendingRequests, setLoading, startLoading, stopLoading]);

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
}

export function useLoaderContext(): LoaderContextValue {
  const context = useContext(LoaderContext);

  if (!context) {
    throw new Error('useLoaderContext must be used within LoaderProvider');
  }

  return context;
}
