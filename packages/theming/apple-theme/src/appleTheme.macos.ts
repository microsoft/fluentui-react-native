import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { NativeModules } from 'react-native';

const { MSFAppleThemeModule } = NativeModules;
const { macosTypography, macosPalette } = MSFAppleThemeModule.getConstants();

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
    content: {
      style: {
        marginStart: 10, //spacing between icon and content
      },
    },
    root: {
      style: {
        margin: 8,
      },
    },
  },
  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },
};

export const defaultAppleThemeMacOS: Theme = {
  colors: macosPalette,
  typography: macosTypography,
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'dynamic' },
};
