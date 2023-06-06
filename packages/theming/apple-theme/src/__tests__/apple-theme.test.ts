import type { AppearanceOptions } from '@fluentui-react-native/theme-types';

import { getIsHighContrast, setIsHighContrast } from '../appleHighContrast.macos';
import { createAppleTheme } from '../createAppleTheme';
import { createMacOSColorAliasTokens, createMacOSShadowAliasTokens } from '../createMacOSAliasTokens';

jest.mock('react-native-macos/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(),
    announceForAccessibility: jest.fn(),
    isAccessibilityServiceEnabled: jest.fn(),
    isBoldTextEnabled: jest.fn(),
    isGrayscaleEnabled: jest.fn(),
    isInvertColorsEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    prefersCrossFadeTransitions: jest.fn(),
    isReduceTransparencyEnabled: jest.fn(),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    setAccessibilityFocus: jest.fn(),
    sendAccessibilityEvent: jest.fn(),
    getRecommendedTimeoutMillis: jest.fn(),
    isHighContrastEnabled: () => Promise.resolve(false),
  },
}));

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
