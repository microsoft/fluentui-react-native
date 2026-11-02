import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens, mapPipelineToTheme, mapPipelineToShadow } from '@fluentui-react-native/design/deprecated';
import type { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/design/theming';
import type { ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

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
