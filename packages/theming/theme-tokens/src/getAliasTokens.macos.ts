import * as macOSLightAliasTokens from './light-macos/tokens-alias';
import * as macOSDarkAliasTokens from './dark-macos/tokens-alias';
import * as macOSLightHCAliasTokens from './light-high-contrast-macos/tokens-alias';
import * as macOSDarkHCAliasTokens from './dark-high-contrast-macos/tokens-alias';
import * as hcAliasTokens from './highContrast/tokens-alias';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { assertNever } from 'assert-never';
import { isHighContrastMode } from '../../apple-theme/src/createAppleTheme.macos';

export function getAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    if (isHighContrastMode) {
      return macOSLightHCAliasTokens.default;
    } else {
      return macOSLightAliasTokens.default;
    }
  } else if (mode === 'dark') {
    if (isHighContrastMode) {
      return macOSDarkHCAliasTokens.default;
    } else {
      return macOSDarkAliasTokens.default;
    }
  } else if (mode === 'highContrast') {
    return hcAliasTokens.default;
  } else {
    assertNever(mode);
  }
}
