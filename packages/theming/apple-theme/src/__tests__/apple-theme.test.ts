import type { AppearanceOptions } from '@fluentui-react-native/theme-types';

import { getIsHighContrast, setIsHighContrast } from '../appleHighContrast.macos';
import { createAppleTheme } from '../createAppleTheme';
import { createMacOSColorAliasTokens, createMacOSShadowAliasTokens } from '../createMacOSAliasTokens';

// For some reason the automatically mocked AccessibilityInfo object is the react-native version, not the
// react-native-macos version, which doesn't contain the isHighContrastEnabled function that is accessed in
// createAppleTheme. Use the actual module instead
jest.dontMock('react-native-macos/Libraries/Components/AccessibilityInfo/AccessibilityInfo');

const macOSAliasTokensTable: [AppearanceOptions, boolean][] = [
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

it.concurrent.each(macOSAliasTokensTable)(
  'createMacOSColorAliasTokens test mode: %s, isHighContrast: %p',
  async (mode: AppearanceOptions, isHighContrast: boolean) => {
    if (mode === 'highContrast') {
      expect(() => createMacOSColorAliasTokens(mode, isHighContrast)).toThrow();
    } else {
      expect(createMacOSColorAliasTokens(mode, isHighContrast)).toMatchSnapshot();
    }
  },
);

it.concurrent.each(macOSAliasTokensTable)(
  'createMacOSShadowAliasTokens test mode: %s, isHighContrast: %p',
  async (mode: AppearanceOptions, isHighContrast: boolean) => {
    if (mode === 'highContrast') {
      expect(() => createMacOSShadowAliasTokens(mode, isHighContrast)).toThrow();
    } else {
      expect(createMacOSShadowAliasTokens(mode, isHighContrast)).toMatchSnapshot();
    }
  },
);
