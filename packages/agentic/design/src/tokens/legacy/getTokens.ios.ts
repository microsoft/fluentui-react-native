import iOSDarkAliasTokens from '@fluentui-react-native/design-tokens-ios/dark/tokens-aliases.json';
import iOSDarkElevatedAliasTokens from '@fluentui-react-native/design-tokens-ios/elevateddark/tokens-aliases.json';
import iOSLightAliasTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json';
import { darkShadows, elevateddarkShadows, hclightShadows, lightShadows } from '../../tokens/generated/shadows.ios';
import type { AppearanceOptions } from '../../theming';
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
    return lightShadows;
  } else if (mode === 'dark') {
    return darkShadows;
  } else if (mode === 'darkElevated') {
    return elevateddarkShadows;
  } else if (mode === 'highContrast') {
    // TODO #2492 we should be throwing an error if highContrast mode is set in iOS, but currently
    // the default theme tries to create a highContrast mode so as a workaround we return the light mode tokens.
    return hclightShadows;
  } else {
    assertNever(mode);
  }
}
