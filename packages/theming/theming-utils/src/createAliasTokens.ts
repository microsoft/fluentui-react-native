import { getAliasTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapPipelineToTheme } from './mapPipelineToTheme';

function createAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createAliasTokens = memoize(createAliasTokensWorker);
