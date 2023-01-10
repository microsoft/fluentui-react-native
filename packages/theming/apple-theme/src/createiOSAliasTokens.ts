import { getAliasTokens, getShadowTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { mapPipelineToTheme, mapPipelineToShadow } from '@fluentui-react-native/theming-utils';
import { memoize } from '@fluentui-react-native/memo-cache';
import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/lib/Shadow.types';

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
