import { INativeTheme } from '../INativeTheme';
import { getStockWebPalette, ITypography } from '@uifabric/theming';

function _defaultTypography(): ITypography {
  return {
    sizes: {
      xxxSmall: 8,
      xxSmall: 9,
      xSmall: 10,
      small: 11,
      medium: 12,
      large: 16,
      xLarge: 24,
      xxLarge: 32,
      xxxLarge: 42
    },
    weights: {
      light: '200',
      semiLight: '300',
      medium: '500',
      semiBold: '700',
      bold: '900'
    },
    families: {
      primary: 'System',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System'
    }
  };
}

export function getBaselinePlatformTheme(): INativeTheme {
  return {
    palette: getStockWebPalette(),
    typography: _defaultTypography(),
    settings: {}
  };
}
