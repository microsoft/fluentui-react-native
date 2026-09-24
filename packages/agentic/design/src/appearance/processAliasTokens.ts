import { PlatformColor } from 'react-native';

type AliasTokens = Record<string, Record<string, unknown>>;
type PlatformColorNameTransform = (color: string) => string;

export const transformWindowsPlatformColorName: PlatformColorNameTransform = (color) => `SystemColor${color}Color`;
export const transformWin32PlatformColorName: PlatformColorNameTransform = (color) => color;

export function processAliasTokens<T extends AliasTokens>(aliasTokens: T, transformColorName: PlatformColorNameTransform): T {
  // The imported token JSON is a module-level singleton that may be shared with other
  // consumers (e.g. the appearance module imports the same raw JSON directly), so this
  // must produce a new object rather than mutating the shared import in place.
  const result: AliasTokens = {};
  for (const key in aliasTokens) {
    const tokenGroup: Record<string, unknown> = aliasTokens[key];
    const newTokenGroup: Record<string, unknown> = {};
    for (const innerKey in tokenGroup) {
      const entry = tokenGroup[innerKey];
      if (typeof entry === 'string' && entry.includes('PlatformColor')) {
        const color = transformColorName(entry.substring(14, entry.length - 1));
        // eslint-disable-next-line @react-native/platform-colors
        newTokenGroup[innerKey] = PlatformColor(color);
      } else {
        newTokenGroup[innerKey] = entry;
      }
    }
    result[key] = newTokenGroup;
  }

  return result as T;
}
