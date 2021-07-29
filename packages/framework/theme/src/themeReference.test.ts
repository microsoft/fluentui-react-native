import { Theme, Spacing, PartialTheme } from '@fluentui-react-native/theme-types';
import { ThemeReference } from './themeReference';
import { mockTheme } from '@fluentui-react-native/test-tools';

const themeBase = mockTheme;

describe('ThemeReference tests', () => {
  it('returns a flat wrapped theme', () => {
    const ref = new ThemeReference(themeBase);
    expect(ref.theme).toEqual(themeBase);
  });

  it('creates a consistent new object', () => {
    const themeRef = new ThemeReference(themeBase, { colors: { white: 'pink' } });
    expect(themeRef.theme).toBe(themeRef.theme);
    expect(themeRef.theme).not.toBe(themeBase);
  });

  it('performs a simple merge', () => {
    const themeRef = new ThemeReference(themeBase, {
      colors: {
        white: 'pink',
      },
      spacing: { l2: '120px' } as Spacing,
    });
    expect(themeRef.theme.colors.white).toEqual('pink');
    expect(themeRef.theme.spacing.l2).toEqual('120px');
  });

  it('transforms via functions correctly', () => {
    const themeRef = new ThemeReference(themeBase, () => ({
      colors: {
        white: 'blue',
      },
    }));
    expect(themeRef.theme.colors.white).toEqual('blue');
  });

  it('handles multiple recipes for a single reference', () => {
    const themeRef = new ThemeReference<Theme, PartialTheme>(themeBase, { colors: { white: 'black' } }, () => ({
      colors: { red: 'green' },
    }));
    expect(themeRef.theme.colors.white).toEqual('black');
    expect(themeRef.theme.colors.red).toEqual('green');
  });

  it('sends updates correctly', () => {
    const themeRef = new ThemeReference(themeBase);
    const signal = { count: 0 };
    const onChange = () => {
      signal.count++;
    };
    themeRef.addOnThemeChanged(onChange);
    expect(signal.count).toEqual(0);
    themeRef.invalidate();
    expect(signal.count).toEqual(1);
    themeRef.removeOnThemeChanged(onChange);
    themeRef.invalidate();
    expect(signal.count).toEqual(1);
  });

  it('chains correctly for definitions and updates', () => {
    const baseRef = new ThemeReference<Theme, PartialTheme>(themeBase, { colors: { white: 'pink' } });
    const nextRef = new ThemeReference(baseRef, { colors: { red: 'purple' } });
    const signal = { count: 0 };
    const onChange = () => {
      signal.count++;
    };
    nextRef.addOnThemeChanged(onChange);
    expect(nextRef.theme.colors.white).toEqual('pink');
    expect(nextRef.theme.colors.red).toEqual('purple');
    expect(signal.count).toEqual(0);
    baseRef.update({ colors: { white: 'blue' } });
    expect(signal.count).toEqual(1);
    expect(nextRef.theme.colors.white).toEqual('blue');
  });
});
