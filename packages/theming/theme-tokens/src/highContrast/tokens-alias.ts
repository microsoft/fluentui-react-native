import { PlatformColor } from 'react-native';

import aliasTokens from '@fluentui-react-native/design-tokens-win32/hc/tokens-aliases.json';

export const hcAliasTokens = processAliasTokens(aliasTokens);

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
