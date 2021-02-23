import { Spacing, Theme } from '@fluentui-react-native/theme-types';

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
  colors: paletteFromAppleColors(),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dynamic' },
};
