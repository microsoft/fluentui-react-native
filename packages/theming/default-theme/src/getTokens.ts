import lightAliasTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-aliases.json';
import darkAliasTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-aliases.json';
import { hcAliasTokens } from './highContrast/tokens-alias';
import lightGlobalTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-global.json';
import darkGlobalTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-global.json';
import hcGlobalTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-global.json';
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
    return lightGlobalTokens.shadow;
  } else if (mode === 'dark') {
    return darkGlobalTokens.shadow;
  } else if (mode === 'highContrast') {
    return hcGlobalTokens.shadow;
  } else {
    assertNever(mode);
  }

  return lightAliasTokens;
}
