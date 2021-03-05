import { Theme, Spacing } from '@fluentui-react-native/theme-types';
import { paletteFromAppleColors } from './appleColors.ios';
import { appleTypography } from './appleTypography.ios';

export function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const appleComponents = {
  // These values correspond to the Primary style of the FluentUI Apple Button
  Button: {
    tokens: {
      borderRadius: 8,
      borderWidth: 1,
    },
    root: {
      style: {
        margin: 8, // Padding around the outside of the button
      },
    },
    stack: {
      style: {
        paddingVertical: 16,
        paddingHorizontal: 20,
      },
    },
    icon: {
      style: {
        marginEnd: 10,
      },
    },
    content: {
      fontSize: 15,
      height: 20,
    },
  },
  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },
};

export const BaseAppleLightThemeIOS: Theme = {
  colors: paletteFromAppleColors(false),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' },
};

export const BaseAppleDarkThemeIOS: Theme = {
  colors: paletteFromAppleColors(true),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dark' },
};
