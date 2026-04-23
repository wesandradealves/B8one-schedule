'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '@/app/registry';
import { appTheme } from '@/styles/theme/theme';
import { GlobalStyle } from '@/app/style';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={appTheme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
