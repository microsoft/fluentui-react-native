import { INativeTheme } from '../INativeTheme';
import { getStockWebPalette, ITypography, ISpacing } from '@uifabric/theming';

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
    }
  };
}

export function defaultSpacing(): ISpacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export function getBaselinePlatformTheme(): INativeTheme {
  return {
    palette: getStockWebPalette(),
    typography: _defaultTypography(),
    spacing: defaultSpacing(),
    settings: {}
  };
}
