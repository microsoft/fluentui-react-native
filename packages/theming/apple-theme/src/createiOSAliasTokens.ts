import { getiOSShadowTokens } from './getiOSTokens';
import { AppearanceOptions } from '@fluentui-react-native/theme-types';
import { mapPipelineToShadow } from '@fluentui-react-native/theming-utils';
import { memoize } from '@fluentui-react-native/memo-cache';
import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types/lib/Shadow.types';

function createiOSShadowAliasTokensWorker(mode: AppearanceOptions): ThemeShadowDefinition {
  const aliasTokens = getiOSShadowTokens(mode);
  return mapPipelineToShadow(aliasTokens);
}

export const createiOSShadowAliasTokens = memoize(createiOSShadowAliasTokensWorker);
