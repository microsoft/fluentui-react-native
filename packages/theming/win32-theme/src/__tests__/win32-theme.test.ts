import type { ButtonTokens, CompoundButtonTokens } from '@fluentui-react-native/button';

import { defaultButtonColorTokens } from '../components/Button/ButtonColorTokens';
import { defaultButtonFontTokens } from '../components/Button/ButtonFontTokens';
import { defaultButtonTokens } from '../components/Button/ButtonTokens';
import { defaultCompoundButtonColorTokens } from '../components/Button/CompoundButtonColorTokens';
import { defaultCompoundButtonFontTokens } from '../components/Button/CompoundButtonFontTokens';
import { defaultCompoundButtonTokens } from '../components/Button/CompoundButtonTokens';
import { createBrandedThemeWithAlias, getCurrentBrandAliasTokens } from '../createBrandedThemeWithAlias';
import { createFontAliasTokens } from '../createFontAliasTokens';
import { createOfficeColorAliasTokens, createOfficeShadowAliasTokens } from '../createOfficeAliasTokens';
import { createOfficeTheme } from '../createOfficeTheme';
import { createPartialOfficeTheme } from '../createPartialOfficeTheme';
import { win32Typography } from '../getThemeTypography';
import { setCurrentHostThemeSetting } from '../NativeModule/hostThemeSetting';
import { fallbackGetPalette, fallbackOfficeModule, getThemingModule } from '../NativeModule/index';

const officeThemes = ['White', 'Colorful', 'DarkGray', 'Black', 'HighContrast'];
const appPrimaries = ['#185abd', '#107c41', '#d83b01', '#80397b', '#0078d4', '#c43e1c'];

it('win32Typography test', () => {
  expect(win32Typography).toMatchSnapshot();
});

it('fallbackOfficeModule test', () => {
  expect(fallbackOfficeModule).toMatchSnapshot();
  expect(fallbackOfficeModule.getConstants()).toMatchSnapshot();
});

it('getThemingModule test', () => {
  const themingModule = getThemingModule();
  expect(themingModule).toMatchSnapshot();
  expect(themingModule[0].getConstants()).toMatchSnapshot();
});

it('createPartialOfficeTheme test', () => {
  const themingModule = getThemingModule();
  const partialOfficeTheme = createPartialOfficeTheme(themingModule[0]);
  expect(partialOfficeTheme).toMatchSnapshot;
});

it('createFontAliasTokens test', () => {
  const fontAliasToken = createFontAliasTokens();
  expect(fontAliasToken).toMatchSnapshot();
});

it('createOfficeTheme test', () => {
  const officeTheme = createOfficeTheme({ paletteName: 'TaskPane', appearance: 'light' }).theme;
  expect(officeTheme).toMatchSnapshot();
});

it.concurrent.each(officeThemes)('createBrandedThemeWithAlias test themeName: %s', async (themeName: string) => {
  setCurrentHostThemeSetting('Colorful');
  const officeTheme = createOfficeTheme({ paletteName: 'TaskPane', appearance: 'light' }).theme;
  const brandedTheme = createBrandedThemeWithAlias(themeName, officeTheme);
  expect(brandedTheme).toMatchSnapshot();
});

it.concurrent.each(officeThemes)('createOfficeColorAliasTokens test officeTheme: %s', async (themeName: string) => {
  const colorAliasToken = createOfficeColorAliasTokens(themeName);
  expect(colorAliasToken).toMatchSnapshot();
});

it.concurrent.each(officeThemes)('createOfficeShadowAliasTokens test officeTheme: %s', async (themeName: string) => {
  const shadowAliasToken = createOfficeShadowAliasTokens(themeName);
  expect(shadowAliasToken).toMatchSnapshot();
});

describe('fallbackGetPalette test', () => {
  it('TaskPane palette', () => {
    const fallbackPalette = fallbackGetPalette('TaskPane');
    expect(fallbackPalette).toMatchSnapshot();
  });

  it('Random palette', () => {
    /**
     * RedColors is just a random pallette, we're just testing to see what happens
     * if we use anything other than the TaskPane palette.
     * */
    const fallbackPalette = fallbackGetPalette('RedColors');
    expect(fallbackPalette).toMatchSnapshot();
  });
});

describe('getCurrentBrandAliasTokens test', () => {
  it.concurrent.each(appPrimaries)('themeName: White, appPrimary: %s', async (appPrimary: string) => {
    const brandAliasTokens = getCurrentBrandAliasTokens('White', appPrimary);
    expect(brandAliasTokens).toMatchSnapshot();
  });

  it.concurrent.each(appPrimaries)('themeName: Colorful, appPrimary: %s', async (appPrimary: string) => {
    const brandAliasTokens = getCurrentBrandAliasTokens('Colorful', appPrimary);
    expect(brandAliasTokens).toMatchSnapshot();
  });

  // Tests the variation of the alias tokens for when isWhiteOrColorfulTheme is not true
  it.concurrent.each(appPrimaries)('themeName: null, appPrimary: %s', async (appPrimary: string) => {
    const brandAliasTokens = getCurrentBrandAliasTokens(null, appPrimary);
    expect(brandAliasTokens).toMatchSnapshot();
  });
});

describe('verify types', () => {
  it('Button types', () => {
    const officeTheme = createOfficeTheme({ paletteName: 'TaskPane', appearance: 'light' }).theme;
    const colorTokens: ButtonTokens = defaultButtonColorTokens(officeTheme);
    expect(colorTokens).toBeTruthy();
    const fontTokens: ButtonTokens = defaultButtonFontTokens(officeTheme);
    expect(fontTokens).toBeTruthy();
    const tokens: ButtonTokens = defaultButtonTokens(officeTheme);
    expect(tokens).toBeTruthy();
  });

  it('CompoundButton types', () => {
    const officeTheme = createOfficeTheme({ paletteName: 'TaskPane', appearance: 'light' }).theme;
    const compoundColorTokens: CompoundButtonTokens = defaultCompoundButtonColorTokens(officeTheme);
    expect(compoundColorTokens).toBeTruthy();
    const compoundButtonFontTokens: CompoundButtonTokens = defaultCompoundButtonFontTokens(officeTheme);
    expect(compoundButtonFontTokens).toBeTruthy();
    const compoundButtonTokens: CompoundButtonTokens = defaultCompoundButtonTokens(officeTheme);
    expect(compoundButtonTokens).toBeTruthy();
  });
});
