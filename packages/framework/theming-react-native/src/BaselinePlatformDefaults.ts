import { ITheme } from './Theme.types';
import { getStockWebPalette, ITypography, ISpacing } from '@uifabricshared/theming-ramp';

function _defaultTypography(): ITypography {
  return {
    sizes: {
      small: 11,
      medium: 12,
      large: 14,
      largePlus: 18,
      extraLarge: 24,
      huge: 32
    },
    weights: {
      light: '300',
      regular: '400',
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
    variants: {
      smallStandard: { face: 'Segoe UI', size: 11, weight: '400' },
      mediumStandard: { face: 'Segoe UI', size: 12, weight: '400' },
      mediumBold: { face: 'Segoe UI', size: 12, weight: '900' },
      largeStandard: { face: 'Segoe UI', size: 14, weight: '400' },
      largePlusStandard: { face: 'Segoe UI', size: 18, weight: '400' },
      largePlusSemibold: { face: 'Segoe UI', size: 18, weight: '700' },
      extraLargeStandard: { face: 'Segoe UI', size: 24, weight: '400' },
      hugeStandard: { face: 'Segoe UI', size: 32, weight: '400' }
    }
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
