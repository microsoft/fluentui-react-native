import { getMacOSAliasTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { memoize } from '@fluentui-react-native/memo-cache';
import { mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createMacOSAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getMacOSAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createMacOSAliasTokens = memoize(createMacOSAliasTokensWorker);
