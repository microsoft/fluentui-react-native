import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { fallbackApplePalette } from './appleTheme.colors.macos';
import { fallbackAppleTypography } from './appleTypography.macos';

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
  // These values correspond to the "Large"  Button Size values of the FluentUI Apple Button
  Button: {
    tokens: {
      borderRadius: 6,
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

// The apple theme defined entirely in JS, intended as a fallback while the native module loads
export const BaseAppleThemeMacOS: Theme = {
  colors: fallbackApplePalette(),
  typography: fallbackAppleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dynamic' },
};
