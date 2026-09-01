import { getLegacyTokenSet, hcAliasTokens, hcShadowTokens } from '@fluentui-react-native/design/tokens/legacy';
import type { ResolvedThemeAppearance } from '@fluentui-react-native/design/theming';

function getOfficeTokenAppearance(officeTheme: string): ResolvedThemeAppearance {
  switch (officeTheme) {
    case 'DarkGray':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' };
    case 'Black':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' };
    case 'HighContrast':
      return { colorScheme: 'light', contrast: 'highContrast', interfaceLevel: 'base' };
    default:
      return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
  }
}

export function getOfficeAliasTokens(officeTheme: string) {
  return officeTheme === 'HighContrast' ? hcAliasTokens : getLegacyTokenSet(getOfficeTokenAppearance(officeTheme)).aliases;
}

export function getOfficeShadowTokens(officeTheme: string) {
  return officeTheme === 'HighContrast' ? hcShadowTokens : getLegacyTokenSet(getOfficeTokenAppearance(officeTheme)).shadows;
}
