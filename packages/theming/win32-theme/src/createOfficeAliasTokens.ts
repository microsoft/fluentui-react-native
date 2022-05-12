import { getOfficeAliasTokens } from './getOfficeAliasTokens';
import { AliasColorTokens, ThemeShadowDefinition } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapPipelineToShadow, mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createOfficeColorAliasTokensWorker(officeTheme: string): AliasColorTokens {
  const aliasTokens = getOfficeAliasTokens(officeTheme);
  return mapPipelineToTheme(aliasTokens);
}

export const createOfficeColorAliasTokens = memoize(createOfficeColorAliasTokensWorker);

function createOfficeShadowAliasTokensWorker(officeTheme: string): ThemeShadowDefinition {
  const aliasTokens = getOfficeAliasTokens(officeTheme);
  return mapPipelineToShadow(aliasTokens);
}

export const createOfficeShadowAliasTokens = memoize(createOfficeShadowAliasTokensWorker);
