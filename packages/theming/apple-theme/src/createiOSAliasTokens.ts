import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, getShadowTokens } from '@fluentui-react-native/design/tokens/legacy';
import type { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/design/theming';
import type { ThemeShadowDefinition } from '@fluentui-react-native/design/theming';
import { mapPipelineToTheme } from '@fluentui-react-native/design/theming';

function createiOSColorAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createiOSColorAliasTokens = memoize(createiOSColorAliasTokensWorker);

function createiOSShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  return getShadowTokens(mode);
}

export const createiOSShadowAliasTokens = memoize(createiOSShadowAliasTokensWorker);
