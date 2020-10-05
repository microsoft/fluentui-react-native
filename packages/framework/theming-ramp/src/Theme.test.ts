import { Theme, PartialTheme } from '@fluentui-react-native/theme-types';
import { resolvePartialTheme } from './Theme';
import { mockTheme } from '@fluentui-react-native/test-tools';

const theme: Theme = {
  ...mockTheme,
  components: {
    View: {
      tokens: {
        backgroundColor: 'bodyBackground',
        fontFamily: 'primary',
      },
    },
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
    expect(resolved.colors.bodySubtext).toEqual(partialTheme.colors.bodySubtext);
    expect(resolved.components).toEqual({
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
    });
  });
});
