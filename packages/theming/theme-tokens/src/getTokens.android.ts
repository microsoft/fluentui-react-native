import lightAliasTokens from '@fluentui-react-native/design-tokens-android/light/tokens-aliases.json';
import darkAliasTokens from '@fluentui-react-native/design-tokens-android/dark/tokens-aliases.json';
import lightShadowTokens from '@fluentui-react-native/design-tokens-android/light/tokens-shadow.json';
import darkShadowTokens from '@fluentui-react-native/design-tokens-android/dark/tokens-shadow.json';

import { AppearanceOptions } from '@fluentui-react-native/theme-types';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightAliasTokens;
  } else if (mode === 'dark') {
    return darkAliasTokens;
  }
  return lightAliasTokens;
}

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightShadowTokens;
  } else if (mode === 'dark') {
    return darkShadowTokens;
  }

  return lightShadowTokens;
}
