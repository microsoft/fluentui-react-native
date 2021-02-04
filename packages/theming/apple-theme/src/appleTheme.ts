import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { getFluentUIApplePalette } from './fluentAppleColors';
import { getAppleSemanticPalette } from './applePlatformColors';
import { paletteFromAppleColors } from './appleTheme.colors';
import { appleTypography } from './appleTheme.typography';

export function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const appleComponents = {
  Button: {
    tokens: {
      borderRadius: 5,
      borderWidth: 1,
      minHeight: 28,
      minWidth: 72,
    },
  },
};

export const defaultAppleThemeMacOS: Theme = {
  colors: paletteFromAppleColors(getFluentUIApplePalette(), getAppleSemanticPalette()),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'auto' },
};
