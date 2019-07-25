import { ITheme } from './Theme.types';
import { IPalette } from './Color.types';
import { ITypography } from './Typography.types';
import { createSettingsWorker } from './SettingsWorker';
import { finalizeColor, finalizeFontWeight, finalizeFontFamily } from './Styles';

const _worker = createSettingsWorker({
  backgroundColor: finalizeColor,
  fontWeight: finalizeFontWeight,
  fontFamily: finalizeFontFamily
});

const theme: ITheme = {
  palette: {
    bodyBackground: '#ff0000'
  } as IPalette,
  typography: {
    families: {
      primary: 'Arial'
    },
    sizes: {
      medium: 14
    },
    weights: {
      medium: '500'
    }
  } as ITypography,
  settings: {
    base: {
      root: {
        style: {
          backgroundColor: 'bodyBackground'
        }
      }
    },
    Text: {
      _parent: 'base',
      root: {
        style: {
          textColor: '#0b1621',
          fontFamily: 'primary'
        }
      },
      _precedence: ['disabled'],
      _overrides: {
        disabled: {
          root: {
            style: {
              fontWeight: 100
            }
          }
        }
      }
    }
  }
};

const _styleKey = 'style';

describe('Style tests', () => {
  test('create style for the base layer', () => {
    const style = _worker.getSettings(theme, 'base').settings.root[_styleKey];
    expect(style).toEqual({
      backgroundColor: '#ff0000'
    });
  });

  test('create style for the Text layer', () => {
    const style = _worker.getSettings(theme, 'Text').settings.root[_styleKey];
    expect(style).toEqual({
      backgroundColor: '#ff0000',
      textColor: '#0b1621',
      fontFamily: 'Arial'
    });
  });

  test('create style for the Text layer with a disabled override', () => {
    const style = _worker.getSettings(theme, 'Text', { disabled: true }).settings.root[_styleKey];
    expect(style).toEqual({
      backgroundColor: '#ff0000',
      textColor: '#0b1621',
      fontFamily: 'Arial',
      fontWeight: 100
    });
  });
});
