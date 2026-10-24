import { defaultFlexTokens } from '../flex/defaults/defaultTokens';
import type { FlexTokens } from '../flex/tokens.types';
import { flexTokensFromTheme } from '../flex/adapters/flexTokensFromTheme';
import { defaultResolvedThemeAppearance, themeAppearanceKey } from './appearance';
import type { ResolvedThemeAppearance } from '../types/appearance.types';
import type { ThemeState } from '../types/themeState.types';
import type { ThemeSource } from './themeSource';

type AppearanceCache = {
  flexTokens?: FlexTokens;
  themeState?: ThemeState;
};

type SourceCache = {
  revision: number;
  byAppearance: Map<string, AppearanceCache>;
};

const sourceCaches = new WeakMap<ThemeSource, SourceCache>();

export const defaultThemeState: ThemeState = {
  tokens: defaultFlexTokens,
  appearance: defaultResolvedThemeAppearance,
  highContrast: false,
  themeStyles: {},
};

function getAppearanceCache(source: ThemeSource, appearance: ResolvedThemeAppearance): AppearanceCache {
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

export function getFlexTokens(source: ThemeSource, appearance: ResolvedThemeAppearance): FlexTokens {
  const cache = getAppearanceCache(source, appearance);
  if (!cache.flexTokens) {
    cache.flexTokens = source.kind === 'flex' ? source.resolveFlexTokens(appearance) : flexTokensFromTheme(source.resolveTheme(appearance));
  }
  return cache.flexTokens;
}

export function getThemeState(source: ThemeSource, appearance: ResolvedThemeAppearance): ThemeState {
  const cache = getAppearanceCache(source, appearance);
  if (!cache.themeState) {
    cache.themeState = {
      tokens: getFlexTokens(source, appearance),
      appearance,
      highContrast: appearance.contrast === 'highContrast',
      themeStyles: {},
    };
  }
  return cache.themeState;
}
