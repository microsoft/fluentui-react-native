import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { getFluentUIAndroidPalette } from './fluentAndroidColors';
import { paletteFromAndroidColors } from './androidTheme.colors';
import { androidTypography } from './androidTypography';

export function androidSpacing(): Spacing {
  return {
    s2: '8px',
    s1: '12px',
    m: '16px',
    l1: '20px',
    l2: '24px',
  };
}

export const androidComponents = {
  Button: {
    tokens: {
      borderRadius: 4,
      borderWidth: 1,
      minHeight: 48,
      minWidth: 92,
    },
  },
  RNFText: {
    tokens: {
      variant: 'bodyStandard',
    },
  },
};

export const defaultAndroidTheme: Theme = {
  colors: paletteFromAndroidColors(getFluentUIAndroidPalette(), false),
  typography: androidTypography(),
  spacing: androidSpacing(),
  components: androidComponents,
  host: { appearance: 'light' },
};

export const defaultAndroidDarkTheme: Theme = {
  colors: paletteFromAndroidColors(getFluentUIAndroidPalette(), true),
  typography: androidTypography(),
  spacing: androidSpacing(),
  components: androidComponents,
  host: { appearance: 'dark' },
};
