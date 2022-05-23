import { getOfficeAliasTokens } from './getOfficeTokens';
import { Variants } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapFontPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createFontAliasTokensWorker(): Partial<Variants> {
  const aliasTokens = getOfficeAliasTokens('Colorful');
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
