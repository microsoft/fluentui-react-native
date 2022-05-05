import { getAliasTokens } from './getAliasTokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createAliasTokens = memoize(createAliasTokensWorker);
