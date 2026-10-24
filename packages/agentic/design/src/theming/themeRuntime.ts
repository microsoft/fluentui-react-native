import { themeAppearanceKey } from './appearance';
import type { FlexTokens } from '../flex/tokens.types';
import type { ResolvedThemeAppearance } from '../types/appearance.types';
import type { ThemeState } from '../types/themeState.types';
import type { FlexThemeSource, ThemeSource } from './themeSource';

/**
 * Values derived from one source revision and one resolved appearance.
 */
export type ThemeAppearanceCache = {
  flexTokens?: FlexTokens;
  themeState?: ThemeState;
};

type SourceCache = {
  revision: number;
  byAppearance: Map<string, ThemeAppearanceCache>;
};

const sourceCaches = new WeakMap<ThemeSource, SourceCache>();

/**
 * Return the revision-scoped cache for one source and appearance. A source
 * revision change replaces every entry for that source.
 */
export function getThemeAppearanceCache(source: ThemeSource, appearance: ResolvedThemeAppearance): ThemeAppearanceCache {
  let sourceCache = sourceCaches.get(source);
  if (!sourceCache || sourceCache.revision !== source.revision) {
    sourceCache = { revision: source.revision, byAppearance: new Map() };
    sourceCaches.set(source, sourceCache);
  }

  const key = themeAppearanceKey(appearance);
  let appearanceCache = sourceCache.byAppearance.get(key);
  if (!appearanceCache) {
    appearanceCache = {};
    sourceCache.byAppearance.set(key, appearanceCache);
  }
  return appearanceCache;
}

/**
 * Resolve Flex tokens from a Flex-authored source. This shared helper never
 * reaches the legacy forward adapter, so legacy-only graphs stay free of it.
 */
export function getFlexSourceTokens(source: FlexThemeSource, appearance: ResolvedThemeAppearance): FlexTokens {
  const cache = getThemeAppearanceCache(source, appearance);
  if (!cache.flexTokens) {
    cache.flexTokens = source.resolveFlexTokens(appearance);
  }
  return cache.flexTokens;
}
