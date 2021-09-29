import * as colorfulAliasTokens from './colorful/tokens-alias';
import * as darkGrayAliasTokens from './darkGray/tokens-alias';
import * as blackAliasTokens from './black/tokens-alias';
import * as hcAliasTokens from './highContrast/tokens-alias';

export function getOfficeAliasTokens(officeTheme: string) {
  if (officeTheme === 'White' || officeTheme === 'Colorful') {
    return colorfulAliasTokens.default;
  } else if (officeTheme === 'DarkGray') {
    return darkGrayAliasTokens.default;
  } else if (officeTheme === 'Black') {
    return blackAliasTokens.default;
  } else if (officeTheme === 'HighContrast') {
    return hcAliasTokens.default;
  }

  return colorfulAliasTokens.default;
}
