import { generatedHighContrastTokenSet } from '../generated/highContrastTokenSet';
import { processAliasTokens, transformWindowsPlatformColorName } from './processAliasTokens';

export const hcAliasTokens = processAliasTokens(generatedHighContrastTokenSet.aliases, transformWindowsPlatformColorName);
