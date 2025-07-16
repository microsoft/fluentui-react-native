import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens } from '@fluentui-react-native/theme-tokens';
import type { Variants } from '@fluentui-react-native/theme-types';
import { mapFontPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createFontAliasTokensWorker(): Partial<Variants> {
  const aliasTokens = getAliasTokens('light');
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
