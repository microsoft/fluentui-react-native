import type { ButtonTokens, CompoundButtonTokens } from '@fluentui-react-native/button';
import type { ThemeOptions, AppearanceOptions } from '@fluentui-react-native/theme-types';

import { defaultButtonColorTokens } from '../components/Button/ButtonColorTokens';
import { defaultButtonFontTokens } from '../components/Button/ButtonFontTokens';
import { defaultButtonTokens } from '../components/Button/ButtonTokens';
import { defaultCompoundButtonColorTokens } from '../components/Button/CompoundButtonColorTokens';
import { defaultCompoundButtonFontTokens } from '../components/Button/CompoundButtonFontTokens';
import { defaultCompoundButtonTokens } from '../components/Button/CompoundButtonTokens';

import { createColorAliasTokens, createShadowAliasTokens } from '../createAliasTokens';
import { createDefaultTheme } from '../createDefaultTheme';
import { defaultFluentTheme, defaultFluentDarkTheme } from '../defaultTheme';

const defaultThemeOptions: ThemeOptions[][] = [
  [{ appearance: 'light', defaultAppearance: 'light' }],
  [{ appearance: 'dark', defaultAppearance: 'light' }],
  [{ appearance: 'highContrast', defaultAppearance: 'light' }],
  [{ appearance: undefined, defaultAppearance: 'light' }],
  [{ appearance: 'dynamic', defaultAppearance: 'light' }],
];

const appearanceOptions: AppearanceOptions[] = ['light', 'dark', 'highContrast'];

beforeAll(() => {
  jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
    getColorScheme: () => 'dark',
    addChangeListener: () => null,
  }));
});

it('defaultFluentTheme test', () => {
  expect(defaultFluentTheme).toMatchSnapshot();
});

it('defaultFluentDarkTheme test', () => {
  expect(defaultFluentDarkTheme).toMatchSnapshot();
});

describe('createDefaultTheme test', () => {
  it.concurrent.each(defaultThemeOptions)('themeOption - %o', async (themeOption: ThemeOptions) => {
    const defaultTheme = createDefaultTheme(themeOption).theme;
    expect(defaultTheme).toMatchSnapshot();
  });
});

describe('createColorAliasTokens test', () => {
  it.concurrent.each(appearanceOptions)('appearanceOptions - %s', async (appearanceOption: AppearanceOptions) => {
    expect(createColorAliasTokens(appearanceOption)).toMatchSnapshot();
  });
});

describe('createShadowAliasTokens test', () => {
  it.concurrent.each(appearanceOptions)('appearanceOptions - %s', async (appearanceOption: AppearanceOptions) => {
    expect(createShadowAliasTokens(appearanceOption)).toMatchSnapshot();
  });
});

describe('verify types', () => {
  it('Button types', () => {
    const defaultTheme = createDefaultTheme().theme;
    const colorTokens: ButtonTokens = defaultButtonColorTokens(defaultTheme);
    expect(colorTokens).toBeTruthy();
    const fontTokens: ButtonTokens = defaultButtonFontTokens(defaultTheme);
    expect(fontTokens).toBeTruthy();
    const tokens: ButtonTokens = defaultButtonTokens(defaultTheme);
    expect(tokens).toBeTruthy();
  });

  it('CompoundButton types', () => {
    const defaultTheme = createDefaultTheme().theme;
    const compoundColorTokens: CompoundButtonTokens = defaultCompoundButtonColorTokens(defaultTheme);
    expect(compoundColorTokens).toBeTruthy();
    const compoundButtonFontTokens: CompoundButtonTokens = defaultCompoundButtonFontTokens(defaultTheme);
    expect(compoundButtonFontTokens).toBeTruthy();
    const compoundButtonTokens: CompoundButtonTokens = defaultCompoundButtonTokens(defaultTheme);
    expect(compoundButtonTokens).toBeTruthy();
  });
})