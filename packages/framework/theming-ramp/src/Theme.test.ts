import { Theme, PartialTheme, ThemeColorDefinition, Typography } from '@fluentui-react-native/theme-types';
import { resolvePartialTheme } from './Theme';

const theme: Theme = {
  colors: {
    background: '#ff0000',
  } as ThemeColorDefinition,
  typography: {
    families: {
      primary: 'Arial',
    },
    sizes: {
      secondary: 14,
    },
    weights: {
      regular: '400',
    },
    variants: {
      secondaryStandard: {
        face: 'Arial',
        size: 14,
        weight: '400',
      },
    },
  } as Typography,
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
  components: {
    View: {
      tokens: {
        backgroundColor: 'bodyBackground',
        fontFamily: 'primary',
      },
    },
  },
  host: {
    appearance: 'light',
  },
};

const partialTheme: PartialTheme = {
  colors: {
    bodySubtext: 'rgb(100,100,100)',
  },
  components: {
    Text: {
      tokens: {
        backgroundColor: 'cyan',
      },
    },
  },
};

describe('Theme tests', () => {
  test("resolvePartialTheme reuses the theme's colors object when the partial theme is empty", () => {
    const resolved = resolvePartialTheme(theme, {});
    expect(resolved.colors).toBe(theme.colors);
  });

  test("resolvePartialTheme reuses the theme's typography object when the partial theme is empty", () => {
    const resolved = resolvePartialTheme(theme, {});
    expect(resolved.typography).toBe(theme.typography);
  });

  test("resolvePartialTheme reuses the theme's layer collection object when the partial theme is empty", () => {
    const resolved = resolvePartialTheme(theme, {});
    expect(resolved.components).toBe(theme.components);
  });

  test('resolvePartialTheme returns a blend of the partial theme and the full theme', () => {
    const resolved = resolvePartialTheme(theme, partialTheme);
    expect(resolved).toEqual({
      colors: ({
        background: '#ff0000',
        bodySubtext: 'rgb(100,100,100)',
      } as unknown) as ThemeColorDefinition,
      typography: {
        families: {
          primary: 'Arial',
        },
        sizes: {
          secondary: 14,
        },
        weights: {
          regular: '400',
        },
        variants: {
          secondaryStandard: {
            face: 'Arial',
            size: 14,
            weight: '400',
          },
        },
      } as Typography,
      spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
      components: {
        View: {
          tokens: {
            backgroundColor: 'bodyBackground',
            fontFamily: 'primary',
          },
        },
        Text: {
          tokens: {
            backgroundColor: 'cyan',
          },
        },
      },
      host: {
        appearance: 'light',
      },
    });
  });
});
