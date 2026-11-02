import { memoize } from '@fluentui-react-native/framework-base';
import { mapPipelineToShadow, mapPipelineToTheme } from '@fluentui-react-native/design/deprecated';
import type { AliasColorTokens, ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

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
