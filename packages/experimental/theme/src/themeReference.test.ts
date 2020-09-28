import { Theme, ColorRamp, Spacing, PartialTheme } from '@fluentui-react-native/theme-types';
import { ThemeReference } from './themeReference';

const defaultColorRamp: ColorRamp = {
  values: [],
  index: -1,
};

const themeBase: Theme = {
  colors: ({
    brand: defaultColorRamp,
    neutral: defaultColorRamp,
    warning: defaultColorRamp,
    black: '#000000',
    neutralDark: '#201f1e',
    neutralPrimary: '#323130',
    neutralPrimaryAlt: '#3b3a39',
    neutralSecondary: '#605e5c',
    neutralSecondaryAlt: '#8a8886',
    neutralTertiary: '#a19f9d',
    neutralTertiaryAlt: '#c8c6c4',
    neutralQuaternary: '#d2d0ce',
    neutralQuaternaryAlt: '#e1dfdd',
    neutralLight: '#edebe9',
    neutralLighter: '#f3f2f1',
    neutralLighterAlt: '#faf9f8',
    white: '#ffffff',
    // Shared Colors
    red: '#d13438',
    redDark: '#a4262c',
    themeDarker: '#004578',
    themeDark: '#005a9e',
    themeDarkAlt: '#106ebe',
    themePrimary: '#0078d4',
    themeSecondary: '#2b88d8',
    themeTertiary: '#71afe5',
    themeLight: '#c7e0f4',
    themeLighter: '#deecf9',
    themeLighterAlt: '#eff6fc',
    accent: '#0078d4',
    blackTranslucent40: 'rgba(0,0,0,.4)',
  } as unknown) as Theme['colors'],
  typography: {
    sizes: { caption: 10, secondary: 12, body: 14, subheader: 16, header: 20, hero: 28, heroLarge: 42 },
    weights: { regular: '400', semiBold: '600' },
    families: { primary: 'Segoe UI', secondary: 'System', cursive: 'System', monospace: 'System', sansSerif: 'System', serif: 'System' },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'primary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'primary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'primary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
    },
  },
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
  host: { appearance: 'light' },
  components: {},
};

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
