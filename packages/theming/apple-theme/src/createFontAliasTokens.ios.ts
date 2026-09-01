import { memoize } from '@fluentui-react-native/framework-base';
import type { Variants } from '@fluentui-react-native/design/theming';
import { mapFontPipelineToTheme } from '@fluentui-react-native/design/theming';
import { getLegacyTokenSet } from '@fluentui-react-native/design/tokens/legacy';

function createFontAliasTokensWorker(): Partial<Variants> {
  return mapFontPipelineToTheme(getLegacyTokenSet({ colorScheme: 'light', contrast: 'standard', interfaceLevel: 'base' }).aliases);
}

export const createFontAliasTokens = memoize(createFontAliasTokensWorker);
