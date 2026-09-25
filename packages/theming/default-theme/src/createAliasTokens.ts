import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens, type EffectiveAppearance } from '@fluentui-react-native/design/appearance';
import type { AliasColorTokens, AppearanceOptions, ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

function appearanceFromLegacy(mode: AppearanceOptions): EffectiveAppearance {
  switch (mode) {
    case 'light':
      return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
    case 'dark':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' };
    case 'darkElevated':
      return { colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'elevated' };
    case 'highContrast':
      return { colorScheme: 'light', contrast: 'highContrast', interfaceLevel: 'base' };
    default:
      return { colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' };
  }
}

function createColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  return getAliasTokens(appearanceFromLegacy(mode));
}

export const createColorAliasTokens = memoize(createColorAliasTokensWorker);

function createShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  return getShadowTokens(appearanceFromLegacy(mode));
}

export const createShadowAliasTokens = memoize(createShadowAliasTokensWorker);
