import { PlatformColor } from 'react-native';

type AliasTokens = Record<string, Record<string, unknown>>;
type PlatformColorNameTransform = (color: string) => string;

export const transformWindowsPlatformColorName: PlatformColorNameTransform = (color) => `SystemColor${color}Color`;
export const transformWin32PlatformColorName: PlatformColorNameTransform = (color) => color;

export function processAliasTokens<T extends AliasTokens>(aliasTokens: T, transformColorName: PlatformColorNameTransform): T {
  // The imported token JSON is intentionally mutated once when its module loads.
  for (const key in aliasTokens) {
    const tokenGroup: Record<string, unknown> = aliasTokens[key];
    for (const innerKey in tokenGroup) {
      const entry = tokenGroup[innerKey];
      if (typeof entry === 'string' && entry.includes('PlatformColor')) {
        const color = transformColorName(entry.substring(14, entry.length - 1));
        // eslint-disable-next-line @react-native/platform-colors
        tokenGroup[innerKey] = PlatformColor(color);
      }
    }
  }

  return aliasTokens;
}
