import { ITheme } from './Theme.types';
import { getStockWebPalette, ITypography, ISpacing, FontWeightValue, FontSize, IFontSizes, IFontVariants } from '@uifabricshared/theming-ramp';
import { Platform } from 'react-native';

function _defaultTypography(): ITypography {

  const defaultsDict = {
    sizes: {
      caption: 8 as FontSize,
      secondary: 9 as FontSize,
      body: 11 as FontSize,
      subheader: 12 as FontSize,
      header: 15 as FontSize,
      hero: 21 as FontSize,
      heroLarge: 32 as FontSize
    } as IFontSizes,
    weights: {
      regular: '400' as FontWeightValue,
      semiBold: '600' as FontWeightValue
    },
    families: {
      primary: 'Segoe UI',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System'
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
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: 'semiBold' }
    } as IFontVariants
  };

  const familiesDictApple = {
    primary: 'System',
    secondary: 'System',
    cursive: 'System',
    monospace: 'System',
    sansSerif: 'System',
    serif: 'System'
  }

  if (Platform.OS === 'macos' || Platform.OS === 'ios') {
    defaultsDict.families = familiesDictApple;
  }

  return defaultsDict;
}

export function defaultSpacing(): ISpacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export function getBaselinePlatformTheme(): ITheme {
  return {
    colors: getStockWebPalette(),
    typography: _defaultTypography(),
    spacing: defaultSpacing(),
    components: {},
    host: {}
  };
}
