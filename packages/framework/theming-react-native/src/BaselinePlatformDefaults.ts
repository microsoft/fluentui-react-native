import { ITheme } from './Theme.types';
import { getStockWebPalette, ITypography, ISpacing } from '@uifabricshared/theming-ramp';

function _defaultTypography(): ITypography {
  return {
    sizes: {
      small: 10,
      medium: 12,
      large: 14,
      largePlus: 16,
      extraLarge: 20,
      huge: 28,
      giant: 42
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
      smallStandard: { face: 'primary', size: 'small', weight: 'regular' },
      mediumStandard: { face: 'primary', size: 'medium', weight: 'regular' },
      mediumSemibold: { face: 'primary', size: 'medium', weight: 'semiBold' },
      mediumBold: { face: 'primary', size: 'medium', weight: 'bold' },
      largeStandard: { face: 'primary', size: 'large', weight: 'regular' },
      largeSemibold: { face: 'primary', size: 'large', weight: 'semiBold' },
      largePlusStandard: { face: 'primary', size: 'largePlus', weight: 'regular' },
      largePlusSemibold: { face: 'primary', size: 'largePlus', weight: 'semiBold' },
      extraLargeStandard: { face: 'primary', size: 'extraLarge', weight: 'regular' },
      extraLargeSemibold: { face: 'primary', size: 'extraLarge', weight: 'semiBold' },
      hugeStandard: { face: 'primary', size: 'huge', weight: 'regular' },
      hugeSemibold: { face: 'primary', size: 'huge', weight: 'semiBold' },
      giantStandard: { face: 'primary', size: 'giant', weight: 'regular' },
      giantSemibold: { face: 'primary', size: 'giant', weight: 'semiBold' }
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
