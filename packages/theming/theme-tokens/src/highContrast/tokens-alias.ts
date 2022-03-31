import { PlatformColor } from 'react-native';
import aliasTokens from '../generated/highContrast/tokens-aliases.json';

const generatedAliasTokens = processAliasTokens(aliasTokens);
export default generatedAliasTokens;

function processAliasTokens(aliasTokens: any) {
  for (const key in aliasTokens) {
    for (const innerKey in aliasTokens[key]) {
      const entry = aliasTokens[key][innerKey];
      if (typeof entry === 'string' && entry.includes('PlatformColor')) {
        const color = 'SystemColor' + entry.substring(14, entry.length - 1) + 'Color';
        aliasTokens[key][innerKey] = PlatformColor(color);
      }
    }
  }

  return aliasTokens;
}
