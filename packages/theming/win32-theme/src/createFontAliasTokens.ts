import { memoize } from '@fluentui-react-native/framework-base/memo-cache';
import type { Variants } from '@fluentui-react-native/theme-types';
import { mapFontPipelineToTheme } from '@fluentui-react-native/theming-utils';

import { getOfficeAliasTokens } from './getOfficeTokens';

function createFontAliasTokensWorker(): Partial<Variants> {
  const aliasTokens = getOfficeAliasTokens('Colorful');
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
