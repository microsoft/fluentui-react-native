import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens, type EffectiveAppearance } from '@fluentui-react-native/design/appearance';
import type { AliasColorTokens, ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

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
  return { colorScheme: 'light', contrast: 'highContrast', interfaceLevel: 'base' };
}

function createOfficeColorAliasTokensWorker(officeTheme: string): AliasColorTokens {
  return getAliasTokens(appearanceFromOfficeTheme(officeTheme));
}

export const createOfficeColorAliasTokens = memoize(createOfficeColorAliasTokensWorker);

function createOfficeShadowAliasTokensWorker(officeTheme: string): ThemeShadowDefinition {
  return getShadowTokens(appearanceFromOfficeTheme(officeTheme));
}

export const createOfficeShadowAliasTokens = memoize(createOfficeShadowAliasTokensWorker);
