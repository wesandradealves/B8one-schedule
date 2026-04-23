'use client';

import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-brand-500: ${({ theme }) => theme._colors.primary[500]};
    --color-brand-900: ${({ theme }) => theme._colors.primary[900]};
    --color-surface: ${({ theme }) => theme._colors.neutral[700]};
    --color-background: ${({ theme }) => theme._colors.neutral[900]};
  }

  body {
    background: var(--color-background);
    color: ${({ theme }) => theme._colors.neutral[0]};
  }
`;

export const AppShell = styled.main.attrs({
  className: 'min-h-screen bg-background text-white antialiased',
})``;
