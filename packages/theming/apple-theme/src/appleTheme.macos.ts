import { PartialTheme, Spacing } from '@fluentui-react-native/theme-types';
import { getStockAppleDynamicPalette } from './fluentAppleColors.macos';
import { getAppleSemanticPalette } from './appleSemanticColors.macos';

import { paletteFromAppleColors } from './appleTheme.colors.macos';

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

export const defaultAppleThemeMacOS: PartialTheme = {
  colors: paletteFromAppleColors(getStockAppleDynamicPalette(), getAppleSemanticPalette()),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' }, // TODO should be 'dynamic'
};
