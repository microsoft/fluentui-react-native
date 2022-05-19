import colorfulAliasTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';
import darkGrayAliasTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import blackAliasTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import { hcAliasTokens } from './highContrast/tokens-alias';
import colorfulGlobalTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-global.json';
import darkGrayGlobalTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-global.json';
import blackGlobalTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-global.json';
import hcGlobalTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-global.json';

export function getOfficeAliasTokens(officeTheme: string) {
  if (officeTheme === 'White' || officeTheme === 'Colorful') {
    return colorfulAliasTokens;
  } else if (officeTheme === 'DarkGray') {
    return darkGrayAliasTokens;
  } else if (officeTheme === 'Black') {
    return blackAliasTokens;
  } else if (officeTheme === 'HighContrast') {
    return hcAliasTokens;
  }

  return colorfulAliasTokens;
}

export function getOfficeShadowTokens(officeTheme: string) {
  if (officeTheme === 'White' || officeTheme === 'Colorful') {
    return colorfulGlobalTokens.shadow;
  } else if (officeTheme === 'DarkGray') {
    return darkGrayGlobalTokens.shadow;
  } else if (officeTheme === 'Black') {
    return blackGlobalTokens.shadow;
  } else if (officeTheme === 'HighContrast') {
    return hcGlobalTokens.shadow;
  }

  return colorfulAliasTokens;
}
