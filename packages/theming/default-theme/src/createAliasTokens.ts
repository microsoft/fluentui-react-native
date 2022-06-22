import { getAliasTokens, getShadowTokens } from './getTokens';
import { AliasColorTokens, AppearanceOptions, ThemeShadowDefinition } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapPipelineToShadow, mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createColorAliasTokens = memoize(createColorAliasTokensWorker);

function createShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  const aliasTokens = getShadowTokens(mode);
  return mapPipelineToShadow(aliasTokens);
}

export const createShadowAliasTokens = memoize(createShadowAliasTokensWorker);
