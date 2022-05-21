import { getMacOSAliasTokens, getMacOSShadowTokens } from './getMacOSTokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { mapPipelineToTheme, mapPipelineToShadow } from '@fluentui-react-native/theming-utils';
import { memoize } from '@fluentui-react-native/memo-cache';
import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/lib/Shadow.types';

function createMacOSColorAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): AliasColorTokens {
  const aliasTokens = getMacOSAliasTokens(mode, isHighContrast);
  return mapPipelineToTheme(aliasTokens);
}

export const createMacOSColorAliasTokens = memoize(createMacOSColorAliasTokensWorker);

function createMacOSShadowAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): ThemeShadowDefinition {
  const aliasTokens = getMacOSShadowTokens(mode, isHighContrast);
  return mapPipelineToShadow(aliasTokens);
}

export const createMacOSShadowAliasTokens = memoize(createMacOSShadowAliasTokensWorker);
