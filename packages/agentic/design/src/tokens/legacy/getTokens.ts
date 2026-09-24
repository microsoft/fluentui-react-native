import darkAliasTokens from '@fluentui-react-native/design-tokens-windows/dark/tokens-aliases.json';
import lightAliasTokens from '@fluentui-react-native/design-tokens-windows/light/tokens-aliases.json';
import { darkShadows, hcShadows, lightShadows } from '../../tokens/generated/shadows';
import type { AppearanceOptions } from '../../theming';
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
    return lightShadows;
  } else if (mode === 'dark' || mode === 'darkElevated') {
    return darkShadows;
  }

  // HC mode.
  return hcShadows;
}
