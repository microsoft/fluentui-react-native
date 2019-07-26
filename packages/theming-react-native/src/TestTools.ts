import { getStockWebPalette, createThemeRegistry } from '@uifabric/theming';
import { setThemeRegistry } from './Global';
import { INativeThemeDefinition, INativeTheme } from './INativeTheme';

const platformDefaults: INativeThemeDefinition = {
  palette: getStockWebPalette(),
  typography: {
    families: {
      primary: 'Helvetica',
      secondary: 'Calibri',
      cursive: 'Segoe Script',
      monospace: 'Consolas',
      sansSerif: 'Verdana',
      serif: 'Times New Roman'
    },
    sizes: {
      xxxSmall: 4,
      xxSmall: 6,
      xSmall: 8,
      small: 10,
      medium: 11,
      large: 14,
      xLarge: 16,
      xxLarge: 18,
      xxxLarge: 24
    },
    weights: {
      light: '200',
      semiLight: '300',
      medium: '500',
      semiBold: '600',
      bold: '700'
    }
  },
  settings: {
    View: {
      root: {
        style: {
          backgroundColor: 'bodyBackground',
          borderWidth: 0,
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          margin: 0,
          padding: 4
        }
      }
    },
    Text: {
      root: {
        style: {
          fontFamily: 'primary',
          fontSize: 'medium',
          fontWeight: 'medium',
          textAlign: 'left'
        }
      }
    },
    Text1: {
      root: {
        style: {
          backgroundColor: '#112233',
          color: '#445566',
          fontFamily: 'cursive',
          fontSize: 'xxSmall',
          fontWeight: 'semiBold',
          textAlign: 'right'
        }
      }
    },
    View1: {
      root: {
        style: {
          backgroundColor: '#000000',
          borderColor: '#ffffff',
          opacity: 0.75,

          borderStyle: 'dotted',
          borderBottomWidth: 50,
          borderEndWidth: 51,
          borderLeftWidth: 52,
          borderRightWidth: 53,
          borderStartWidth: 54,
          borderTopWidth: 55,
          borderWidth: 56,

          alignContent: 'flex-start',
          alignItems: 'center',
          alignSelf: 'auto',

          start: 20,
          end: 21,
          left: 22,
          right: 23,
          top: 24,
          bottom: 25,
          width: 26,
          height: 27,
          maxHeight: 28,
          maxWidth: 29,
          minHeight: 30,
          minWidth: 31,

          display: 'flex',
          direction: 'ltr',
          position: 'absolute',
          overflow: 'scroll',
          justifyContent: 'space-around',
          aspectRatio: 3.14,
          flex: 4,
          flexBasis: 5,
          flexDirection: 'row',
          flexGrow: 6,
          flexShrink: 7,
          flexWrap: 'wrap-reverse',

          margin: 70,
          marginBottom: 71,
          marginEnd: 72,
          marginHorizontal: 73,
          marginLeft: 74,
          marginRight: 75,
          marginStart: 76,
          marginTop: 77,
          marginVertical: 78,

          padding: 90,
          paddingBottom: 91,
          paddingHorizontal: 92,
          paddingLeft: 93,
          paddingRight: 94,
          paddingTop: 95,
          paddingVertical: 96
        }
      }
    }
  }
};

export function initializeTestThemeRegistry(): void {
  setThemeRegistry(createThemeRegistry(platformDefaults as INativeTheme));
}
