import { ITheme, IPartialTheme } from './Theme.types';
import { resolvePartialTheme } from './Theme';
import { IPalette } from './Color.types';
import { ITypography } from './Typography.types';

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
    View: {
      root: {
        backgroundColor: 'bodyBackground',
        fontFamily: 'primary'
      }
    }
  }
};

const partialTheme: IPartialTheme = {
  palette: {
    bodySubtext: 'rgb(100,100,100)'
  },
  settings: {
    Text: {
      root: {
        backgroundColor: 'cyan'
      }
    }
  }
};

describe('Theme tests', () => {
  test("resolvePartialTheme reuses the theme's palette object when the partial theme is empty", () => {
    const resolved = resolvePartialTheme(theme, {});
    expect(resolved.palette).toBe(theme.palette);
  });

  test("resolvePartialTheme reuses the theme's typography object when the partial theme is empty", () => {
    const resolved = resolvePartialTheme(theme, {});
    expect(resolved.typography).toBe(theme.typography);
  });

  test("resolvePartialTheme reuses the theme's layer collection object when the partial theme is empty", () => {
    const resolved = resolvePartialTheme(theme, {});
    expect(resolved.settings).toBe(theme.settings);
  });

  test('resolvePartialTheme copies theme.palette when the partial theme has an empty palette property', () => {
    const resolved = resolvePartialTheme(theme, {
      palette: {}
    });
    expect(resolved.palette).toEqual(theme.palette);
    expect(resolved.palette).not.toBe(theme.palette);
  });

  test('resolvePartialTheme copies theme.typography when the partial theme has an empty typography property', () => {
    const resolved = resolvePartialTheme(theme, {
      typography: {}
    });
    expect(resolved.typography).toEqual(theme.typography);
    expect(resolved.typography).not.toBe(theme.typography);
  });

  test('resolvePartialTheme returns a blend of the partial theme and the full theme', () => {
    const resolved = resolvePartialTheme(theme, partialTheme);
    expect(resolved).toEqual({
      palette: {
        bodyBackground: '#ff0000',
        bodySubtext: 'rgb(100,100,100)'
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
        View: {
          root: {
            backgroundColor: 'bodyBackground',
            fontFamily: 'primary'
          }
        },
        Text: {
          root: {
            backgroundColor: 'cyan'
          }
        }
      }
    });
  });
});
