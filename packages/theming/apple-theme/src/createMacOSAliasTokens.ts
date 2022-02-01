import { getAliasTokens } from '@fluentui-react-native/theme-tokens';
import { AliasColorTokens, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { mapPipelineToTheme } from '@fluentui-react-native/theming-utils';

function createMacOSAliasTokensWorker(mode: AppearanceOptions): AliasColorTokens {
  const aliasTokens = getAliasTokens(mode);
  return mapPipelineToTheme(aliasTokens);
}

export const createMacOSAliasTokens = createMacOSAliasTokensWorker;
