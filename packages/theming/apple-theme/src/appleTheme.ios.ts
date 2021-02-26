import { Theme, Spacing } from '@fluentui-react-native/theme-types';
import { paletteFromAppleColors } from './appleTheme.colors.ios';
import { appleTypography } from './appleTheme.typography.ios';

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

export const BaseAppleThemeIOS: Theme = {
  colors: paletteFromAppleColors(),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' }, // TODO should be 'dynamic'
};
