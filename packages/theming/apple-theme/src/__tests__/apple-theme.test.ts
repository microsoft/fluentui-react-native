import { createAppleTheme } from '../createAppleTheme';
import { createMacOSColorAliasTokens, createMacOSShadowAliasTokens } from '../createMacOSAliasTokens';
import { getIsHighContrast, setIsHighContrast } from '../appleHighContrast.macos';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';

const macOsAliasTokensTable: [AppearanceOptions, boolean][] = [
  ['light', true],
  ['light', false],
  ['dark', true],
  ['dark', false],
  ['highContrast', null],
];

it('createAppleTheme test', () => {
  const appleTheme = createAppleTheme().theme;
  expect(appleTheme).toMatchSnapshot();
});

it('IsHighContrast test', () => {
  setIsHighContrast(false);
  expect(getIsHighContrast()).toBe(false);
  setIsHighContrast(true);
  expect(getIsHighContrast()).toBe(true);
});

it.concurrent.each(macOsAliasTokensTable)(
  'createMacOSColorAliasTokens test mode: %s, isHighContrast: %p',
  async (mode: AppearanceOptions, isHighContrast: boolean) => {
    if (mode === 'highContrast') {
      expect(() => createMacOSColorAliasTokens(mode, isHighContrast)).toThrow();
    } else {
      expect(createMacOSColorAliasTokens(mode, isHighContrast)).toMatchSnapshot();
    }
  },
);

it.concurrent.each(macOsAliasTokensTable)(
  'createMacOSShadowAliasTokens test mode: %s, isHighContrast: %p',
  async (mode: AppearanceOptions, isHighContrast: boolean) => {
    if (mode === 'highContrast') {
      expect(() => createMacOSShadowAliasTokens(mode, isHighContrast)).toThrow();
    } else {
      expect(createMacOSShadowAliasTokens(mode, isHighContrast)).toMatchSnapshot();
    }
  },
);
