import { getAliasTokens, getShadowTokens, type EffectiveAppearance } from '@fluentui-react-native/design/appearance';

function appearanceFromOfficeTheme(officeTheme: string): EffectiveAppearance {
  if (officeTheme === 'White' || officeTheme === 'Colorful') {
    return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
  }
  if (officeTheme === 'DarkGray') {
    return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' };
  }
  if (officeTheme === 'Black') {
    return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' };
  }
  if (officeTheme === 'HighContrast') {
    return { colorScheme: 'light', contrast: 'highContrast', interfaceLevel: 'base' };
  }
  return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
}

export function getOfficeAliasTokens(officeTheme: string) {
  return getAliasTokens(appearanceFromOfficeTheme(officeTheme));
}

export function getOfficeShadowTokens(officeTheme: string) {
  return getShadowTokens(appearanceFromOfficeTheme(officeTheme));
}
