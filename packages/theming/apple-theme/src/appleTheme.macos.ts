import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { getFluentUIApplePalette } from './fluentAppleColors.macos';
import { getAppleSemanticPalette } from './applePlatformColors.macos';
import { paletteFromAppleColors } from './appleTheme.colors.macos';
import { appleTypography } from './appleTypography.macos';

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
