'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '@/app/registry';
import { appTheme } from '@/styles/theme/theme';
import { GlobalStyle } from '@/app/style';
import { LoaderProvider } from '@/context/loader';
import { FeedbackProvider } from '@/context/feedback';
import { AuthProvider } from '@/context/auth';
import { useLoader } from '@/hooks/useLoader';
import { useAuth } from '@/hooks/useAuth';
import { setupApiInterceptors } from '@/services/api';
import Spinner from '@/components/spinner/spinner';

function InterceptorsBootstrap() {
  const { startLoading, stopLoading } = useLoader();
  const { token, clearSession } = useAuth();

  useEffect(() => {
    const teardown = setupApiInterceptors({
      onRequestStart: startLoading,
      onRequestEnd: stopLoading,
      onUnauthorized: clearSession,
      getToken: () => token,
    });

    return teardown;
  }, [clearSession, startLoading, stopLoading, token]);

  return null;
}

function ProvidersLayer({ children }: { children: ReactNode }) {
  return (
    <LoaderProvider>
      <FeedbackProvider>
        <AuthProvider>
          <InterceptorsBootstrap />
          {children}
          <Spinner />
        </AuthProvider>
      </FeedbackProvider>
    </LoaderProvider>
  );
}

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    });
  }, []);

  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={appTheme}>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          <ProvidersLayer>{children}</ProvidersLayer>
        </QueryClientProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
