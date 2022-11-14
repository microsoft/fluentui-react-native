import colorfulAliasTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';
import darkGrayAliasTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import blackAliasTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import { hcAliasTokens } from './highContrast/tokens-alias';
import colorfulShadowTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-shadow.json';
import darkGrayShadowTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-shadow.json';
import blackShadowTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-shadow.json';
import hcShadowTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-shadow.json';

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
    return colorfulShadowTokens;
  } else if (officeTheme === 'DarkGray') {
    return darkGrayShadowTokens;
  } else if (officeTheme === 'Black') {
    return blackShadowTokens;
  } else if (officeTheme === 'HighContrast') {
    return hcShadowTokens;
  }

  return colorfulAliasTokens;
}
