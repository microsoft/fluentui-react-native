import { getOfficeAliasTokens } from './getOfficeAliasTokens';
import { Variants } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapFontPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createFontAliasTokensWorker(officeTheme: string): Partial<Variants> {
  const aliasTokens = getOfficeAliasTokens(officeTheme);
  return mapFontPipelineToTheme(aliasTokens);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
