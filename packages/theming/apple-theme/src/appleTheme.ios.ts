import { Theme, Spacing } from '@fluentui-react-native/theme-types';
import { paletteFromAppleColors } from './appleTheme.colors.ios';
import { appleTypography } from './appleTheme.typography.ios';
import { getFluentUIAppleDarkPalette, getFluentUIAppleLightPalette } from './fluentAppleColors.ios';

export function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const appleComponents = {
  // These values correspond to the "Large"  Button Size values of the FluentUI Apple Button
  Button: {
    tokens: {
      borderRadius: 5,
      borderWidth: 1,
      minHeight: 28,
      minWidth: 72,
    },
    root: {
      style: {
        margin: 8, // Padding around the outside of the button
      },
    },
    stack: {
      style: {
        paddingVertical: 4.5,
        minHeight: 28,
      },
    },
    icon: {
      style: {
        marginEnd: 10,
      },
    },
    content: {
      fontSize: 15,
    },
  },
  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },
};

export const BaseAppleLightThemeIOS: Theme = {
  colors: paletteFromAppleColors(getFluentUIAppleLightPalette()),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' }, // TODO should be 'dynamic'
};

export const BaseAppleDarkThemeIOS: Theme = {
  colors: paletteFromAppleColors(getFluentUIAppleDarkPalette()),
  typography: appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' }, // TODO should be 'dynamic'
};
