import lightShadowTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-shadow.json';
import darkShadowTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-shadow.json';
import hcShadowTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-shadow.json';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightShadowTokens;
  } else if (mode === 'dark') {
    return darkShadowTokens;
  }

  // HC mode.
  return hcShadowTokens;
}
