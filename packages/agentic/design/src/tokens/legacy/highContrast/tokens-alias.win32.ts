import { generatedHighContrastTokenSet } from '../generated/highContrastTokenSet';
import { processAliasTokens, transformWin32PlatformColorName } from './processAliasTokens';

export const hcAliasTokens = processAliasTokens(generatedHighContrastTokenSet.aliases, transformWin32PlatformColorName);
