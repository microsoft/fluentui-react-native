import { Theme, Typography, Spacing, FontWeightValue, FontSize, FontSizes, Variants } from '@fluentui-react-native/theme-types';
import { Platform } from 'react-native';
import { getStockWebPalette, getStockWebDarkPalette } from './defaultColors';

function _defaultTypography(): Typography {
  const defaultsDict = {
    sizes: {
      caption: 10 as FontSize,
      secondary: 12 as FontSize,
      body: 14 as FontSize,
      subheader: 16 as FontSize,
      header: 20 as FontSize,
      hero: 28 as FontSize,
      heroLarge: 42 as FontSize,
    } as FontSizes,
    weights: {
      regular: '400' as FontWeightValue,
      semiBold: '600' as FontWeightValue,
    },
    families: {
      primary: 'Segoe UI',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'primary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'primary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'primary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
    } as Variants,
  };

  if (Platform.OS === 'macos' || Platform.OS === 'ios') {
    const familiesDictApple = {
      primary: 'System',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    };
    defaultsDict.families = familiesDictApple;
  }

  // In certain cases on win32, semibold font renders incorrectly so 'Segoe UI Semibold' is used
  if (Platform.OS === ('win32' as any)) {
    const familiesDictWin32 = {
      primary: 'Segoe UI',
      secondary: 'Segoe UI Semibold',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    };
    defaultsDict.families = familiesDictWin32;

    const variantsDictWin32 = {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'secondary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'secondary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'secondary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'secondary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'secondary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'secondary', size: 'heroLarge', weight: 'semiBold' },
    } as Variants;
    defaultsDict.variants = variantsDictWin32;
  }

  return defaultsDict;
}

export function defaultSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const defaultFluentTheme: Theme = {
  colors: getStockWebPalette(),
  typography: _defaultTypography(),
  spacing: defaultSpacing(),
  components: {},
  host: { appearance: 'light' },
};

export const defaultFluentDarkTheme: Theme = {
  colors: getStockWebDarkPalette(),
  typography: defaultFluentTheme.typography,
  spacing: defaultFluentTheme.spacing,
  components: {},
  host: { appearance: 'dark' },
};
