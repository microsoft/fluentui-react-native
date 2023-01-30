import iOSLightAliasTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json';
import iOSDarkAliasTokens from '@fluentui-react-native/design-tokens-ios/dark/tokens-aliases.json';
import iOSDarkElevatedAliasTokens from '@fluentui-react-native/design-tokens-ios/elevateddark/tokens-aliases.json';
import iOSLightShadowTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-shadow.json';
import iOSDarkShadowTokens from '@fluentui-react-native/design-tokens-ios/dark/tokens-shadow.json';

import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return iOSLightAliasTokens;
  } else if (mode === 'dark') {
    return iOSDarkAliasTokens;
  } else if (mode === 'darkElevated') {
    return iOSDarkElevatedAliasTokens;
  } else if (mode === 'highContrast') {
    // TODO #2492 we should be throwing an error if highContrast mode is set in iOS, but currently
    // the default theme tries to create a highContrast mode so as a workaround we return the light mode tokens.
    return iOSLightAliasTokens;
  } else {
    assertNever(mode);
  }
}

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return iOSLightShadowTokens;
  } else if (mode === 'dark' || mode === 'darkElevated') {
    return iOSDarkShadowTokens;
  } else if (mode === 'highContrast') {
    // TODO #2492 we should be throwing an error if highContrast mode is set in iOS, but currently
    // the default theme tries to create a highContrast mode so as a workaround we return the light mode tokens.
    return iOSLightShadowTokens;
  } else {
    assertNever(mode);
  }
}
