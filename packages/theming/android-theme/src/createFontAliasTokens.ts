import { memoize } from '@fluentui-react-native/framework-base';
import { getAliasTokens } from '@fluentui-react-native/design/tokens/legacy';
import type { Variants } from '@fluentui-react-native/design/theming';
import { mapFontPipelineToTheme } from '@fluentui-react-native/design/theming';

function createFontAliasTokensWorker(): Partial<Variants> {
  const aliasTokens = getAliasTokens('light');
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
