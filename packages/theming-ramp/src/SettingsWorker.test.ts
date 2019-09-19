import { ITheme } from './Theme.types';
import { IPalette } from './Color.types';
import { ITypography } from './Typography.types';
import { getSettings } from './SettingsWorker';

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
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
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
    const style = getSettings(theme, 'base').settings.root![_styleKey];
    expect(style).toEqual({
      backgroundColor: 'bodyBackground'
    });
  });

  test('create style for the Text layer', () => {
    const style = getSettings(theme, 'Text').settings.root![_styleKey];
    expect(style).toEqual({
      backgroundColor: 'bodyBackground',
      textColor: '#0b1621',
      fontFamily: 'primary'
    });
  });

  test('create style for the Text layer with a disabled override', () => {
    const style = getSettings(theme, 'Text', { disabled: true }).settings.root![_styleKey];
    expect(style).toEqual({
      backgroundColor: 'bodyBackground',
      textColor: '#0b1621',
      fontFamily: 'primary',
      fontWeight: 100
    });
  });
});
