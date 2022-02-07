import { getMacOSAliasTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { mapPipelineToTheme } from '@fluentui-react-native/theming-utils';
import { memoize } from '@fluentui-react-native/memo-cache';

function createMacOSAliasTokensWorker(mode: AppearanceOptions, isHighContrast: boolean): AliasColorTokens {
  const aliasTokens = getMacOSAliasTokens(mode, isHighContrast);
  return mapPipelineToTheme(aliasTokens);
}

export const createMacOSAliasTokens = memoize(createMacOSAliasTokensWorker);
