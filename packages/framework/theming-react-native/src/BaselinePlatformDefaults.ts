import { ITheme } from './Theme.types';
import { getStockWebPalette, ITypography, ISpacing } from '@uifabricshared/theming-ramp';
import { IFontVariants } from '../../../framework/theming-ramp/src/Typography.types';

export function getDefaultVariants(): IFontVariants {
  return {
    smallStandard: { face: 'Segoe UI', size: 11, weight: '500' },
    mediumStandard: { face: 'Segoe UI', size: 12, weight: '500' },
    mediumSemibold: { face: 'Segoe UI', size: 12, weight: '700' },
    largeStandard: { face: 'Segoe UI', size: 14, weight: '500' },
    largeSemibold: { face: 'Segoe UI', size: 14, weight: '700' },
    extraLargeStandard: { face: 'Segoe UI', size: 18, weight: '500' },
    extraLargeSemibold: { face: 'Segoe UI', size: 18, weight: '700' },
    extraLargeBold: { face: 'Segoe UI', size: 18, weight: '900' },
    hugeStandard: { face: 'Segoe UI', size: 24, weight: '500' },
    hugeSemibold: { face: 'Segoe UI', size: 24, weight: '700' },
    hugeBold: { face: 'Segoe UI', size: 24, weight: '900' },
    giantStandard: { face: 'Segoe UI', size: 32, weight: '500' },
    giantSemibold: { face: 'Segoe UI', size: 32, weight: '700' }
  };
}

function _defaultTypography(): ITypography {
  return {
    sizes: {
      xxxSmall: 8,
      xxSmall: 9,
      xSmall: 10,
      small: 11,
      medium: 12,
      large: 14,
      xLarge: 18,
      xxLarge: 24,
      xxxLarge: 32
    },
    weights: {
      light: '200',
      semiLight: '300',
      medium: '500',
      semiBold: '700',
      bold: '900'
    },
    families: {
      primary: 'Segoe UI',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System'
    },
    variants: getDefaultVariants()
  };
}

export function defaultSpacing(): ISpacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export function getBaselinePlatformTheme(): ITheme {
  return {
    colors: getStockWebPalette(),
    typography: _defaultTypography(),
    spacing: defaultSpacing(),
    components: {}
  };
}
