import darkAliasTokens from '@fluentui-react-native/design-tokens-android/dark/tokens-aliases.json';
import lightAliasTokens from '@fluentui-react-native/design-tokens-android/light/tokens-aliases.json';
import { darkShadows, lightShadows } from '../../tokens/generated/shadows.android';
import type { AppearanceOptions } from '../../theming';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightAliasTokens;
  } else if (mode === 'dark') {
    return darkAliasTokens;
  }

  // TODO #2492 we should be throwing an error if highContrast mode is set in Android, but currently
  // the default theme tries to create a highContrast mode so as a workaround we return the light mode tokens.
  return lightAliasTokens;
}

export function getShadowTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return lightShadows;
  } else if (mode === 'dark') {
    return darkShadows;
  }

  // TODO #2492 we should be throwing an error if highContrast mode is set in Android, but currently
  // the default theme tries to create a highContrast mode so as a workaround we return the light mode tokens.
  return lightShadows;
}
