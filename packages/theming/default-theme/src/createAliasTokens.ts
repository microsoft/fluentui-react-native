import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens } from '@fluentui-react-native/design/tokens/legacy';
import type { AliasColorTokens, AppearanceOptions, ThemeShadowDefinition } from '@fluentui-react-native/design/theming';
import { mapPipelineToTheme } from '@fluentui-react-native/design/theming';

function createColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createColorAliasTokens = memoize(createColorAliasTokensWorker);

function createShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  return getShadowTokens(mode);
}

export const createShadowAliasTokens = memoize(createShadowAliasTokensWorker);
