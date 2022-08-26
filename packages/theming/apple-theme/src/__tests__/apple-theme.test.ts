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

// const macOsAliasShadowTokensTable = [
//   ['light', true, macOSLightHCShadowTokens.shadow],
//   ['light', false, macOSLightShadowTokens.shadow],
//   ['dark', true, macOSDarkHCShadowTokens.shadow],
//   ['dark', false, macOSDarkShadowTokens.shadow],
//   ['highContrast', null, null],
// ];

it('createAppleTheme test', () => {
  const appleTheme = createAppleTheme().theme;
  expect(appleTheme).toMatchSnapshot();
});

describe('createMacOSColorAliasTokens test', () => {
  it.concurrent.each(macOsAliasTokensTable)('mode: %s, isHighContrast: %p', async (mode: AppearanceOptions, isHighContrast: boolean) => {
    if (mode === 'highContrast') {
      expect(() => createMacOSColorAliasTokens(mode, isHighContrast)).toThrow();
    } else {
      expect(createMacOSColorAliasTokens(mode, isHighContrast)).toMatchSnapshot();
    }
  });
});
