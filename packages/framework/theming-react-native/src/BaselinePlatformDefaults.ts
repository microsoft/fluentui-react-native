import { ITheme } from './Theme.types';
import { getStockWebPalette, ITypography, ISpacing } from '@uifabricshared/theming-ramp';

function _defaultTypography(): ITypography {
  return {
    sizes: {
      small: 8,
      medium: 9,
      mediumPlus: 10,
      large: 11,
      largePlus: 14,
      extraLarge: 16,
      huge: 22,
      giant: 30
    },
    weights: {
      light: '300',
      regular: '400',
      semiBold: '600',
      bold: '700'
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
      mediumPlusStandard: { face: 'primary', size: 'mediumPlus', weight: 'regular' },
      mediumPlusSemibold: { face: 'primary', size: 'mediumPlus', weight: 'semiBold' },
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
