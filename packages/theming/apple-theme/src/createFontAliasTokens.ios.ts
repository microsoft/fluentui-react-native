import aliasTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json'; // Font alias tokens should be the same for all color styles
import type { Variants } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapFontPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createFontAliasTokensWorker(): Partial<Variants> {
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
