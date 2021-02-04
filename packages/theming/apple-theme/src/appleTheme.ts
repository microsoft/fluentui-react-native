import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { getFluentUIApplePalette } from './fluentAppleColors';
import { getAppleSemanticPalette } from './applePlatformColors';
import { paletteFromAppleColors } from './appleTheme.colors';
import { appleTypography } from './appleTheme.typography';

export function appleSpacing(): Spacing {
  return {
    s2: '8px',
    s1: '12px',
    m: '16px',
    l1: '20px',
    l2: '24px',
  };
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
  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },
};

export const defaultAppleThemeMacOS: Theme = {
  colors: paletteFromAppleColors(getFluentUIApplePalette(), getAppleSemanticPalette()),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dynamic' },
};
