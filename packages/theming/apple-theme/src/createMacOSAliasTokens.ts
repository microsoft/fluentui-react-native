import { memoize } from '@fluentui-react-native/framework-base';
import type { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/design/theming';
import type { ThemeShadowDefinition } from '@fluentui-react-native/design/theming';
import { mapPipelineToTheme } from '@fluentui-react-native/design/theming';

import { getMacOSAliasTokens, getMacOSShadowTokens } from './getMacOSTokens';

function createMacOSColorAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): AliasColorTokens {
  const aliasTokens = getMacOSAliasTokens(mode, isHighContrast);
  return mapPipelineToTheme(aliasTokens);
}

export const createMacOSColorAliasTokens = memoize(createMacOSColorAliasTokensWorker);

function createMacOSShadowAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): ThemeShadowDefinition {
  return getMacOSShadowTokens(mode, isHighContrast);
}

export const createMacOSShadowAliasTokens = memoize(createMacOSShadowAliasTokensWorker);
