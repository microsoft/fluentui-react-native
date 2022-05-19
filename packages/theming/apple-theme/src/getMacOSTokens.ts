import macOSLightAliasTokens from '@fluentui-react-native/design-tokens-macos/light/tokens-aliases.json';
import macOSDarkAliasTokens from '@fluentui-react-native/design-tokens-macos/dark/tokens-aliases.json';
import macOSLightHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hclight/tokens-aliases.json';
import macOSDarkHCAliasTokens from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-aliases.json';
import macOSLightGlobalTokens from '@fluentui-react-native/design-tokens-macos/light/tokens-global.json';
import macOSDarkGlobalTokens from '@fluentui-react-native/design-tokens-macos/dark/tokens-global.json';
import macOSLightHCGlobalTokens from '@fluentui-react-native/design-tokens-macos/hclight/tokens-global.json';
import macOSDarkHCGlobalTokens from '@fluentui-react-native/design-tokens-macos/hcdark/tokens-global.json';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

export function getMacOSAliasTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  if (mode === 'light') {
    if (isHighContrast) {
      return macOSLightHCAliasTokens;
    } else {
      return macOSLightAliasTokens;
    }
  } else if (mode === 'dark') {
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
      return macOSLightHCGlobalTokens.shadow;
    } else {
      return macOSLightGlobalTokens.shadow;
    }
  } else if (mode === 'dark') {
    if (isHighContrast) {
      return macOSDarkHCGlobalTokens.shadow;
    } else {
      return macOSDarkGlobalTokens.shadow;
    }
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on macOS');
  } else {
    assertNever(mode);
  }
}
