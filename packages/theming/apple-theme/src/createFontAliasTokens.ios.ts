import aliasTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-aliases.json'; // Font alias tokens should be the same for all color styles
import { memoize } from '@fluentui-react-native/framework-base';
import type { Variants } from '@fluentui-react-native/theme-types';
import { mapFontPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createFontAliasTokensWorker(): Partial<Variants> {
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
