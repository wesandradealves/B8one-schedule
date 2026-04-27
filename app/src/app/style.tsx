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
    --color-status-pending-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.warning[500]} 16%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-status-pending-border: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.warning[500]} 44%,
      ${({ theme }) => theme._colors.neutral[300]}
    );
    --color-status-pending-fg: ${({ theme }) => theme._colors.warning[500]};
    --color-status-scheduled-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.info[500]} 16%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-status-scheduled-border: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.info[500]} 44%,
      ${({ theme }) => theme._colors.neutral[300]}
    );
    --color-status-scheduled-fg: ${({ theme }) => theme._colors.info[500]};
    --color-status-cancelled-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.neutral[500]} 18%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-status-cancelled-fg: ${({ theme }) => theme._colors.neutral[700]};
    --color-slot-available-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.success[500]} 20%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-slot-available-bg-hover: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.success[500]} 30%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-slot-available-bg-selected: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.success[500]} 38%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-slot-available-outline: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.success[500]} 40%,
      ${({ theme }) => theme._colors.neutral[300]}
    );
    --color-slot-available-fg: ${({ theme }) => theme._colors.success[500]};
    --color-slot-busy-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.neutral[500]} 26%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-slot-busy-stripe-strong: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.neutral[500]} 18%,
      transparent
    );
    --color-slot-busy-stripe-soft: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.neutral[500]} 8%,
      transparent
    );
    --color-slot-busy-fg: ${({ theme }) => theme._colors.neutral[700]};
    --color-slot-unavailable-bg: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.neutral[500]} 14%,
      ${({ theme }) => theme._colors.neutral[0]}
    );
    --color-slot-unavailable-fg: ${({ theme }) => theme._colors.neutral[500]};
    --color-calendar-focus-ring: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.info[500]} 50%,
      transparent
    );
    --color-calendar-focus-hover: color-mix(
      in srgb,
      ${({ theme }) => theme._colors.info[500]} 14%,
      transparent
    );
  }

  body {
    background: var(--color-background);
    color: ${({ theme }) => theme._colors.neutral[900]};
  }
`;

export const AppShell = styled.main.attrs({
  className: 'min-h-screen bg-background text-black antialiased',
})``;
