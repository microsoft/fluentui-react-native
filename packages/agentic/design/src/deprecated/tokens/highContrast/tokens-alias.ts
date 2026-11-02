import aliasTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';

import { processAliasTokens, transformWindowsPlatformColorName } from './processAliasTokens';

export const hcAliasTokens = processAliasTokens(aliasTokens, transformWindowsPlatformColorName);
