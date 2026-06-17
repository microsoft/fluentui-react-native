import type { Theme } from '@fluentui-react-native/theme-types';

import { SentinelAllocator } from './reverseMap.ts';
import type { ReverseMap } from './reverseMap.ts';

/**
 * The result of sentinelizing a base theme: the cloned theme (every targeted
 * leaf replaced with a unique sentinel) plus the reverse map that lets a
 * resolved token tree be mapped back to semantic theme paths.
 */
export interface SentinelTheme {
  theme: Theme;
  reverseMap: ReverseMap;
}

/**
 * Build a SENTINEL theme from a base `Theme`.
 *
 * Every leaf under `theme.colors` is deep-cloned and replaced with a unique,
 * type-valid sentinel color hex (e.g. `#FF0001`). A reverse map is produced that
 * maps each sentinel value back to its semantic path (e.g.
 * `"#FF0001" -> "colors.buttonBackground"`).
 *
 * The `colors` namespace is the primary target because the v1 token functions
 * we pin read almost exclusively from `theme.colors.*`. Other namespaces
 * (`shadows`, `typography`, `spacing`) are intentionally left untouched for this
 * pass — they carry structured/typed values where a flat unique-string sentinel
 * would be type-invalid and the token functions don't consume them by value.
 *
 * NOTE: `globalTokens.*` (a static JSON import, not part of the theme) is NOT
 * sentinelized here. Those values resolve to their real static numbers and pass
 * through `resolveTokensForTheme` unchanged. Sentinelizing them requires jest
 * module mocking.
 * TODO(agentic-analyzer PLAN phase 3): add a `createSentinelGlobalTokens()` +
 * jest mock factory and extend the reverse map across the `globalTokens.*`
 * namespace.
 */
export function createSentinelTheme(base: Theme): SentinelTheme {
  const allocator = new SentinelAllocator();

  // Structured clone of the whole theme so we never mutate the caller's base.
  // structuredClone drops functions, but a `Theme` is plain data.
  const theme = structuredClone(base) as Theme;

  // Sentinelize every leaf under `colors`. ThemeColorDefinition is a flat
  // map of ColorValue, so each own enumerable key is a single leaf.
  const colors = theme.colors as Record<string, unknown>;
  for (const key of Object.keys(colors)) {
    const value = colors[key];
    // Only replace string-valued colors. Platform/semantic color objects
    // (e.g. { semantic: '...' }) are left as-is — they are rare on the default
    // web theme and a flat hex sentinel would not be type-valid for them.
    if (typeof value === 'string') {
      colors[key] = allocator.allocateColor(`colors.${key}`);
    }
  }

  return { theme, reverseMap: allocator.getReverseMap() };
}
