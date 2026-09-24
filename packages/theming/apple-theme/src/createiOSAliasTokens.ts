import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens, type EffectiveAppearance } from '@fluentui-react-native/design/appearance';
import type { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/design/theming';
import type { ThemeShadowDefinition } from '@fluentui-react-native/design/theming';
import { mapPipelineToTheme } from '@fluentui-react-native/design/theming';

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

function createiOSColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(appearanceFromLegacy(mode));
  return mapPipelineToTheme(aliasTokens);
}

export const createiOSColorAliasTokens = memoize(createiOSColorAliasTokensWorker);

function createiOSShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  return getShadowTokens(appearanceFromLegacy(mode));
}

export const createiOSShadowAliasTokens = memoize(createiOSShadowAliasTokensWorker);
