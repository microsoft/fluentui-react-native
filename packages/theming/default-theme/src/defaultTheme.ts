import { Theme, Typography, Spacing, FontWeightValue, FontSize, FontSizes, Variants } from '@fluentui-react-native/theme-types';
import { Platform } from 'react-native';
import { getStockWebPalette, getStockWebDarkPalette, getStockWebHCPalette } from './defaultColors';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { createShadowAliasTokens } from './createAliasTokens';
import { memoize } from '@fluentui-react-native/memo-cache';

function _defaultTypography(): Typography {
  const defaultsDict = {
    sizes: {
      caption: globalTokens.font.size100 as FontSize,
      secondary: globalTokens.font.size200 as FontSize,
      body: globalTokens.font.size300 as FontSize,
      subheader: globalTokens.font.size400 as FontSize,
      header: globalTokens.font.size500 as FontSize,
      hero: globalTokens.font.size700 as FontSize,
      heroLarge: globalTokens.font.size900 as FontSize,
    } as FontSizes,
    weights: {
      regular: globalTokens.font.weight.regular as FontWeightValue,
      semiBold: globalTokens.font.weight.semibold as FontWeightValue,
    },
    families: {
      primary: 'Segoe UI',
      secondary: 'Segoe UI',
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
      // mocked out
      caption1: { face: 'primary', size: 'caption', weight: 'regular' },
      body1: { face: 'primary', size: 'secondary', weight: 'regular' },
      body1Strong: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      body2: { face: 'primary', size: 'body', weight: 'regular' },
      body2Strong: { face: 'primary', size: 'body', weight: 'semiBold' },
      subtitle1: { face: 'primary', size: 'header', weight: 'regular' },
      subtitle1Strong: { face: 'primary', size: 'header', weight: 'semiBold' },
      subtitle2: { face: 'primary', size: 'subheader', weight: 'regular' },
      subtitle2Strong: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      title1: { face: 'primary', size: 'hero', weight: 'regular' },
      title1Strong: { face: 'primary', size: 'hero', weight: 'semiBold' },
      largeTitle: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      display: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
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

  return defaultsDict;
}

export function defaultSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

function defaultFluentThemeWorker(): Theme {
  return {
    colors: getStockWebPalette(),
    typography: _defaultTypography(),
    spacing: defaultSpacing(),
    shadows: createShadowAliasTokens('light'),
    components: {},
    host: { appearance: 'light' },
  };
}

export const defaultFluentTheme = memoize(defaultFluentThemeWorker);

function defaultFluentDarkThemeWorker(): Theme {
  const defaultTheme = defaultFluentTheme();
  return {
    colors: getStockWebDarkPalette(),
    typography: defaultTheme.typography,
    shadows: createShadowAliasTokens('dark'),
    spacing: defaultTheme.spacing,
    components: {},
    host: { appearance: 'dark' },
  };
}

export const defaultFluentDarkTheme = memoize(defaultFluentDarkThemeWorker);

function defaultFluentHighConstrastThemeWorker(): Theme {
  const defaultTheme = defaultFluentTheme();
  return {
    colors: getStockWebHCPalette(),
    typography: defaultTheme.typography,
    shadows: createShadowAliasTokens('highContrast'),
    spacing: defaultTheme.spacing,
    components: {},
    host: { appearance: 'highContrast' },
  };
}

export const defaultFluentHighConstrastTheme = memoize(defaultFluentHighConstrastThemeWorker);
