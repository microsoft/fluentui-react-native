import { getOfficeAliasTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createOfficeAliasTokensWorker(officeTheme: string): AliasColorTokens {
  const aliasTokens = getOfficeAliasTokens(officeTheme);

  return mapPipelineToTheme(aliasTokens);
}

export const createOfficeAliasTokens = memoize(createOfficeAliasTokensWorker);
