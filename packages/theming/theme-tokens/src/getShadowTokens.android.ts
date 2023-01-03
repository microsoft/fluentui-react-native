import lightShadowTokens from '@fluentui-react-native/design-tokens-android/light/tokens-shadow.json';
import darkShadowTokens from '@fluentui-react-native/design-tokens-android/dark/tokens-shadow.json';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightShadowTokens;
  } else if (mode === 'dark') {
    return darkShadowTokens;
  }

  return lightShadowTokens;
}
