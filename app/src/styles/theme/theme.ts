import { _breakpoints, _colors } from '@/assets/scss/variables';

export const appTheme = {
  _breakpoints,
  _colors,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
} as const;

export type AppTheme = typeof appTheme;
