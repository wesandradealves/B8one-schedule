export const palette = {
  primary: {
    50: '#E9EDFF',
    100: '#C7D1FF',
    300: '#7E93FF',
    500: '#2F46C7',
    700: '#2439A3',
    900: '#15246E',
  },
  neutral: {
    0: '#FFFFFF',
    100: '#F5F5F5',
    300: '#D6D6D6',
    500: '#8C8C8C',
    700: '#4A4A4A',
    900: '#161516',
  },
  success: {
    500: '#16A34A',
  },
  warning: {
    500: '#F59E0B',
  },
  danger: {
    500: '#DC2626',
  },
  info: {
    500: '#2563EB',
  },
} as const;

export type Palette = typeof palette;
