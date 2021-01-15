import { Theme, Typography, Spacing, FontWeightValue, FontSize, FontSizes, Variants } from '@fluentui-react-native/theme-types';
import { getStockApplePalette, getStockAppleDarkPalette } from './appleColors';

function _appleTypography(): Typography {
  const appleDict = {
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
      primary: 'System',
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

  return appleDict;
}

export function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const defaultAppleTheme: Theme = {
  colors: getStockApplePalette(),
  typography: _appleTypography(),
  spacing: appleSpacing(),
  components: {},
  host: { appearance: 'light' },
};

export const defaultAppleDarkTheme: Theme = {
  colors: getStockAppleDarkPalette(),
  typography: defaultAppleTheme.typography,
  spacing: defaultAppleTheme.spacing,
  components: {},
  host: { appearance: 'dark' },
};
