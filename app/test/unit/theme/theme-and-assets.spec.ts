import { palette } from '@/styles/theme/palette';
import { appTheme } from '@/styles/theme/theme';
import { breakpoints } from '@/assets/scss/breakpoints';
import { colors } from '@/assets/scss/colors';
import { _breakpoints, _colors } from '@/assets/scss/variables';

describe('theme and asset tokens', () => {
  it('should expose the shared palette and breakpoints consistently', () => {
    expect(palette.neutral[0]).toBe('#FFFFFF');
    expect(breakpoints.lg).toBe('1024px');
    expect(colors).toBe(palette);
    expect(_breakpoints).toBe(breakpoints);
    expect(_colors).toBe(colors);
  });

  it('should compose app theme from centralized tokens', () => {
    expect(appTheme._colors).toBe(_colors);
    expect(appTheme._breakpoints).toBe(_breakpoints);
    expect(appTheme.spacing.md).toBe('1rem');
    expect(appTheme.radii.full).toBe('9999px');
  });
});
