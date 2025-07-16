import { memoize } from '@fluentui-react-native/framework-base';
import type { AliasColorTokens, ThemeShadowDefinition } from '@fluentui-react-native/theme-types';
import { mapPipelineToShadow, mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

import { getOfficeAliasTokens, getOfficeShadowTokens } from './getOfficeTokens';

function createOfficeColorAliasTokensWorker(officeTheme: string): AliasColorTokens {
  const aliasTokens = getOfficeAliasTokens(officeTheme);
  return mapPipelineToTheme(aliasTokens);
}

export const createOfficeColorAliasTokens = memoize(createOfficeColorAliasTokensWorker);

function createOfficeShadowAliasTokensWorker(officeTheme: string): ThemeShadowDefinition {
  const aliasTokens = getOfficeShadowTokens(officeTheme);
  return mapPipelineToShadow(aliasTokens);
}

export const createOfficeShadowAliasTokens = memoize(createOfficeShadowAliasTokensWorker);
