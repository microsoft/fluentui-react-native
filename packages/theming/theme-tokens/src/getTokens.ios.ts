import iOSLightAliasTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json';
import iOSDarkAliasTokens from '@fluentui-react-native/design-tokens-ios/dark/tokens-aliases.json';
import iOSLightShadowTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-shadow.json';
import iOSDarkShadowTokens from '@fluentui-react-native/design-tokens-ios/dark/tokens-shadow.json';

import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return iOSLightAliasTokens;
  } else if (mode === 'dark') {
    return iOSDarkAliasTokens;
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on iOS');
  } else {
    assertNever(mode);
  }
}

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return iOSLightShadowTokens;
  } else if (mode === 'dark') {
    return iOSDarkShadowTokens;
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on iOS');
  } else {
    assertNever(mode);
  }
}
