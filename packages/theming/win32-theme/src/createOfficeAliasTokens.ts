import { memoize } from '@fluentui-react-native/framework-base';
import type { AliasColorTokens, ThemeShadowDefinition } from '@fluentui-react-native/design/theming';
import { mapPipelineToTheme } from '@fluentui-react-native/design/theming';

import { getOfficeAliasTokens, getOfficeShadowTokens } from './getOfficeTokens';

function createOfficeColorAliasTokensWorker(officeTheme: string): AliasColorTokens {
  const aliasTokens = getOfficeAliasTokens(officeTheme);
  return mapPipelineToTheme(aliasTokens);
}

export const createOfficeColorAliasTokens = memoize(createOfficeColorAliasTokensWorker);

function createOfficeShadowAliasTokensWorker(officeTheme: string): ThemeShadowDefinition {
  return getOfficeShadowTokens(officeTheme);
}

export const createOfficeShadowAliasTokens = memoize(createOfficeShadowAliasTokensWorker);
