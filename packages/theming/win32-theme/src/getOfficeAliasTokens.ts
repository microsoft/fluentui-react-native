import colorfulAliasTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';
import darkGrayAliasTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import blackAliasTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import { hcAliasTokens } from './highContrast/tokens-alias';

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
