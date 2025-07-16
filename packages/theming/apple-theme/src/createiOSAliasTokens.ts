import { memoize } from '@fluentui-react-native/framework-base/memo-cache';
import { getAliasTokens, getShadowTokens } from '@fluentui-react-native/theme-tokens';
import type { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import type { ThemeShadowDefinition } from '@fluentui-react-native/theme-types';
import { mapPipelineToTheme, mapPipelineToShadow } from '@fluentui-react-native/theming-utils';

function createiOSColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createiOSColorAliasTokens = memoize(createiOSColorAliasTokensWorker);

function createiOSShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  const aliasTokens = getShadowTokens(mode);
  return mapPipelineToShadow(aliasTokens);
}

export const createiOSShadowAliasTokens = memoize(createiOSShadowAliasTokensWorker);
