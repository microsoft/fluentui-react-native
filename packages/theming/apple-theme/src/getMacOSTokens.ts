import macOSDarkAliasTokens from '@fluentui-react-native/design-tokens-macos/dark/tokens-aliases.json';
import macOSDarkShadowTokens from '@fluentui-react-native/design-tokens-macos/dark/tokens-shadow.json';
import macOSDarkHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-aliases.json';
import macOSDarkHCShadowTokens from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-shadow.json';
import macOSLightHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hclight/tokens-aliases.json';
import macOSLightHCShadowTokens from '@fluentui-react-native/design-tokens-macos/hclight/tokens-shadow.json';
import macOSLightAliasTokens from '@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json';
import macOSLightShadowTokens from '@fluentui-react-native/design-tokens-macos/light/tokens-shadow.json';
import type { AppearanceOptions } from '@fluentui-react-native/theme-types';
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
      return macOSLightHCShadowTokens;
    } else {
      return macOSLightShadowTokens;
    }
  } else if (mode === 'dark' || mode === 'darkElevated') {
    if (isHighContrast) {
      return macOSDarkHCShadowTokens;
    } else {
      return macOSDarkShadowTokens;
    }
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on macOS');
  } else {
    assertNever(mode);
  }
}
