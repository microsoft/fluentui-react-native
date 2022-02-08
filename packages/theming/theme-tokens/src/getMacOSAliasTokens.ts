import * as macOSLightAliasTokens from './light-macos/tokens-alias';
import * as macOSDarkAliasTokens from './dark-macos/tokens-alias';
import * as macOSLightHCAliasTokens from './light-high-contrast-macos/tokens-alias';
import * as macOSDarkHCAliasTokens from './dark-high-contrast-macos/tokens-alias';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';

export function getMacOSAliasTokens(mode: AppearanceOptions, isHighContrast: boolean) {
  if (mode === 'light') {
    if (isHighContrast) {
      return macOSLightHCAliasTokens.default;
    } else {
      return macOSLightAliasTokens.default;
    }
  } else if (mode === 'dark') {
    if (isHighContrast) {
      return macOSDarkHCAliasTokens.default;
    } else {
      return macOSDarkAliasTokens.default;
    }
  } else if (mode === 'highContrast') {
    throw new Error('highContrast is not a valid AppearanceOptions on macOS');
  } else {
    assertNever(mode);
  }
}
