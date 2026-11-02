import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens, mapFontPipelineToTheme } from '@fluentui-react-native/design/deprecated';
import type { Variants } from '@fluentui-react-native/design/theming';

function createFontAliasTokensWorker(): Partial<Variants> {
  const aliasTokens = getAliasTokens('light');
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
