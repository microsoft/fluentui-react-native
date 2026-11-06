import aliasTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';

import { processAliasTokens, transformWin32PlatformColorName } from './processAliasTokens';

export const hcAliasTokens = processAliasTokens(aliasTokens, transformWin32PlatformColorName);
