import type { PartialTheme, Theme } from './types/Theme.types';
import { themeFromFlexTokens } from './compat';
import { themeAppearanceKey } from './appearance';
import type { ResolvedThemeAppearance } from './appearance.types';
import { useThemeBoundary } from './context';
import { getFlexTokens } from './themeRuntime';
import type { FlexThemeSource } from './themeSource';

type LegacyCache = {
  revision: number;
  byAppearance: Map<string, Theme>;
};

const legacyCaches = new WeakMap<FlexThemeSource, LegacyCache>();

function getLegacyTheme(source: FlexThemeSource, appearance: ResolvedThemeAppearance): Theme {
  let cache = legacyCaches.get(source);
  if (!cache || cache.revision !== source.revision) {
    cache = { revision: source.revision, byAppearance: new Map() };
    legacyCaches.set(source, cache);
  }

  const key = themeAppearanceKey(appearance);
  let theme = cache.byAppearance.get(key);
  if (!theme) {
    const fallback: Theme | PartialTheme | undefined = source.resolveLegacyFallback?.(appearance);
    theme = themeFromFlexTokens(getFlexTokens(source, appearance), appearance, { fallback });
    cache.byAppearance.set(key, theme);
  }
  return theme;
}

/**
 * Access the current legacy Fluent Theme. A Flex-authored source is converted
 * lazily only when this legacy hook is consumed.
 */
export function useTheme(): Theme {
  const boundary = useThemeBoundary();
  if (!boundary) {
    return undefined;
  }

  return boundary.source.kind === 'legacy'
    ? boundary.source.resolveTheme(boundary.appearance.resolved)
    : getLegacyTheme(boundary.source, boundary.appearance.resolved);
}
