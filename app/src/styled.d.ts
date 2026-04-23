/* eslint-disable @typescript-eslint/no-empty-object-type */
import 'styled-components';
import type { AppTheme } from '@/styles/theme/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
