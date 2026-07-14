/**
 * Platforms a component can ship on. A component declares the set of
 * platforms it supports in its metadata. The set is not derived from
 * file extensions because cross-platform components often have a
 * single `.ts` that handles every platform internally.
 *
 * Note: `'win32'` is not in `Platform.OS`'s TypeScript union (React
 * Native types haven't been updated), but `react-native-windows`
 * supports it at runtime.
 */
export const PLATFORM_VALUES = ['ios', 'android', 'macos', 'windows', 'win32'] as const;

export type Platform = (typeof PLATFORM_VALUES)[number];

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORM_VALUES as readonly string[]).includes(value);
}
