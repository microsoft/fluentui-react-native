import blackAliasTokens from '@fluentui-react-native/design-tokens-win32/black/tokens-aliases.json';
import colorfulAliasTokens from '@fluentui-react-native/design-tokens-win32/colorful/tokens-aliases.json';
import darkGrayAliasTokens from '@fluentui-react-native/design-tokens-win32/darkgray/tokens-aliases.json';
import {
  darkShadows,
  hcShadows,
  lightShadows,
} from '@fluentui-react-native/design/tokens/generated/shadows';
import { hcAliasTokens } from '@fluentui-react-native/design/tokens/legacy';

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
    return lightShadows;
  } else if (officeTheme === 'DarkGray' || officeTheme === 'Black') {
    return darkShadows;
  } else if (officeTheme === 'HighContrast') {
    return hcShadows;
  }

  return lightShadows;
}
