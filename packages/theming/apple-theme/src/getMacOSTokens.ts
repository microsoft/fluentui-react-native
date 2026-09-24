import macOSDarkAliasTokens from '@fluentui-react-native/design-tokens-macos/dark/tokens-aliases.json';
import macOSDarkHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-aliases.json';
import macOSLightHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hclight/tokens-aliases.json';
import macOSLightAliasTokens from '@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json';
import { darkShadows, hcdarkShadows, hclightShadows, lightShadows } from '@fluentui-react-native/design/tokens/generated/shadows.macos';
import { getShadowTokens } from '@fluentui-react-native/design/tokens/legacy';
import type { AppearanceOptions } from '@fluentui-react-native/design/theming';
import { assertNever } from 'assert-never';

export function getMacOSAliasTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  if (mode === 'light') {
    if (isHighContrast) {
      return macOSLightHCAliasTokens;
    } else {
      return macOSLightAliasTokens;
    }
  } else if (mode === 'dark' || mode === 'darkElevated') {
    if (isHighContrast) {
      return macOSDarkHCAliasTokens;
    } else {
      return macOSDarkAliasTokens;
    }
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on macOS');
  } else {
    assertNever(mode);
  }
}

export function getMacOSShadowTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  if (mode === 'light') {
    if (isHighContrast) {
      return hclightShadows;
    } else {
      return lightShadows;
    }
  } else if (mode === 'dark' || mode === 'darkElevated') {
    if (isHighContrast) {
      return hcdarkShadows;
    } else {
      return darkShadows;
    }
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on macOS');
  } else {
    assertNever(mode);
  }
}
