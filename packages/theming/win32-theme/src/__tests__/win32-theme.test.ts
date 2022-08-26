import { createOfficeTheme } from '../createOfficeTheme';
import { createPartialOfficeTheme } from '../createPartialOfficeTheme';
import { fallbackGetPalette, fallbackOfficeModule, getThemingModule } from '../NativeModule/index';
import { paletteFromOfficeColors } from '../paletteFromOfficeColors';
import { createOfficeColorAliasTokens as createOfficeAliasTokens } from '../createOfficeAliasTokens';
import { createFontAliasTokens } from '../createFontAliasTokens';
import { createBrandedThemeWithAlias, getCurrentBrandAliasTokens } from '../createBrandedThemeWithAlias';
import { win32Typography } from '../getThemeTypography';
import { ThemeOptions } from '@fluentui-react-native/theme-types';

const themeOptions: ThemeOptions[][] = [
  [{ paletteName: 'TaskPane', appearance: 'light' }],
  [{ paletteName: 'TaskPane', appearance: 'dark' }],
  [{ paletteName: 'TaskPane', appearance: 'dynamic' }],
];

describe('fallbackGetPalette test', () => {
  it('TaskPane palette', () => {
    const fallbackPalette = fallbackGetPalette('TaskPane');
    expect(fallbackPalette).toMatchSnapshot();
  });

  it('Any other palette', () => {
    /**
     * RedColors is just a random pallette, we're just testing to what happens
     * if we use anything other than the TaskPane palette.
     * */
    const fallbackPalette = fallbackGetPalette('RedColors');
    expect(fallbackPalette).toMatchSnapshot();
  });
});

it('fallbackOfficeModule test', () => {
  expect(fallbackOfficeModule).toMatchSnapshot();
});

it('getThemingModule test', () => {
  const themingModule = getThemingModule();
  expect(themingModule).toMatchSnapshot();
});

it('paletteFromOfficeColors');

it('createPartialOfficeTheme test', () => {
  const themingModule = getThemingModule();
  expect(createPartialOfficeTheme(themingModule[0])).toMatchSnapshot;
});

it.concurrent.each(themeOptions)('createOfficeTheme test', async (option: ThemeOptions) => {
  const officeTheme = createOfficeTheme(option).theme;
  expect(officeTheme).toMatchSnapshot();
});
