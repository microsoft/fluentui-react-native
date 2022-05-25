import lightAliasTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-aliases.json';
import darkAliasTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-aliases.json';
import { hcAliasTokens } from './highContrast/tokens-alias';
import lightShadowTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-shadow.json';
import darkShadowTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-shadow.json';
import hcShadowTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-shadow.json';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightAliasTokens;
  } else if (mode === 'dark') {
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
    return lightShadowTokens.shadow;
  } else if (mode === 'dark') {
    return darkShadowTokens.shadow;
  } else if (mode === 'highContrast') {
    return hcShadowTokens.shadow;
  } else {
    assertNever(mode);
  }

  return lightAliasTokens;
}
