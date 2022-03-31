import macOSLightAliasTokens from './light-macos/tokens-alias';
import macOSDarkAliasTokens from './dark-macos/tokens-alias';
import macOSLightHCAliasTokens from './light-high-contrast-macos/tokens-alias';
import macOSDarkHCAliasTokens from './dark-high-contrast-macos/tokens-alias';
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
