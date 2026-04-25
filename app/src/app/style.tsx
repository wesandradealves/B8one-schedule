'use client';

import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  :root {
    --color-brand-50: ${({ theme }) => theme._colors.primary[50]};
    --color-brand-100: ${({ theme }) => theme._colors.primary[100]};
    --color-brand-500: ${({ theme }) => theme._colors.primary[500]};
    --color-brand-700: ${({ theme }) => theme._colors.primary[700]};
    --color-brand-900: ${({ theme }) => theme._colors.primary[900]};
    --color-surface: ${({ theme }) => theme._colors.neutral[100]};
    --color-background: ${({ theme }) => theme._colors.neutral[0]};
    --color-border: ${({ theme }) => theme._colors.neutral[300]};
    --color-text-primary: ${({ theme }) => theme._colors.neutral[900]};
    --color-text-secondary: ${({ theme }) => theme._colors.neutral[700]};
    --color-sidebar-hover: ${({ theme }) => theme._colors.primary[100]};
    --color-danger: ${({ theme }) => theme._colors.danger[500]};
    --color-success: ${({ theme }) => theme._colors.success[500]};
    --color-warning: ${({ theme }) => theme._colors.warning[500]};
    --color-info: ${({ theme }) => theme._colors.info[500]};
    --color-card-surface: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.primary[50]} 40%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-card-border: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.primary[100]} 80%,
      ${({ theme }) => theme._colors.neutral[300]}
    );
    --color-card-icon-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.primary[100]} 60%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-card-icon-foreground: ${({ theme }) => theme._colors.primary[700]};
  }

  body {
    background: var(--color-background);
    color: ${({ theme }) => theme._colors.neutral[900]};
  }
`;

export const AppShell = styled.main.attrs({
  className: 'min-h-screen bg-background text-black antialiased',
})``;
