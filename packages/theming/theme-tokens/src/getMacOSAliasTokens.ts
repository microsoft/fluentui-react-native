import * as macOSLightAliasTokens from './light-macos/tokens-alias';
import * as macOSDarkAliasTokens from './dark-macos/tokens-alias';
import * as hcAliasTokens from './highContrast/tokens-alias';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';

export function getMacOSAliasTokens(mode: AppearanceOptions) {
  if (mode === 'light') {
    return macOSLightAliasTokens.default;
  } else if (mode === 'dark') {
    return macOSDarkAliasTokens.default;
  } else if (mode === 'highContrast') {
    return hcAliasTokens.default;
  }
  return macOSLightAliasTokens.default;
}
