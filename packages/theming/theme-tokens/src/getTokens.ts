import hcShadowTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-shadow.json';
import darkAliasTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-aliases.json';
import darkShadowTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-shadow.json';
import lightAliasTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-aliases.json';
import lightShadowTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-shadow.json';
import type { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

import { hcAliasTokens } from './highContrast/tokens-alias';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightAliasTokens;
  } else if (mode === 'dark' || mode === 'darkElevated') {
    return darkAliasTokens;
  } else if (mode === 'highContrast') {
    return hcAliasTokens;
  } else {
    assertNever(mode);
  }

  return lightAliasTokens;
}

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightShadowTokens;
  } else if (mode === 'dark') {
    return darkShadowTokens;
  }

  // HC mode.
  return hcShadowTokens;
}
