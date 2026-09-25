import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens, type EffectiveAppearance } from '@fluentui-react-native/design/appearance';
import type { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/design/theming';
import type { ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

function appearanceFromLegacy(mode: AppearanceOptions, isHighContrast: boolean): EffectiveAppearance {
  return {
    colorScheme: mode === 'light' ? 'light' : 'dark',
    contrast: mode === 'highContrast' || isHighContrast ? 'highContrast' : 'standard',
    interfaceLevel: mode === 'darkElevated' ? 'elevated' : 'base',
  };
}

function createMacOSColorAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): AliasColorTokens {
  return getAliasTokens(appearanceFromLegacy(mode, isHighContrast));
}

export const createMacOSColorAliasTokens = memoize(createMacOSColorAliasTokensWorker);

function createMacOSShadowAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): ThemeShadowDefinition {
  return getShadowTokens(appearanceFromLegacy(mode, isHighContrast));
}

export const createMacOSShadowAliasTokens = memoize(createMacOSShadowAliasTokensWorker);
