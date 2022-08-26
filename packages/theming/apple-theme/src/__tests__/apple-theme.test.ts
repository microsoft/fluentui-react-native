import { createAppleTheme } from '../createAppleTheme';
import { ThemeReference } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';

const macOsAliasTokensTable = [
  ['light', true, macOSLightHCAliasTokens],
  ['light', false, macOSLightAliasTokens],
  ['dark', true, macOSDarkHCAliasTokens],
  ['dark', false, macOSDarkAliasTokens],
  ['highContrast', null, null],
];

const macOsAliasShadowTokensTable = [
  ['light', true, macOSLightHCShadowTokens.shadow],
  ['light', false, macOSLightShadowTokens.shadow],
  ['dark', true, macOSDarkHCShadowTokens.shadow],
  ['dark', false, macOSDarkShadowTokens.shadow],
  ['highContrast', null, null],
];

it('createAppleTheme test', () => {
  const appleTheme = createAppleTheme().theme;
  expect(appleTheme).toMatchSnapshot();
});
