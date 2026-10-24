import { defaultFlexTokens } from './defaults/defaultTokens';
import { flexTokensFromTheme } from './adapters/flexTokensFromTheme';
import type { FlexTokens } from './tokens.types';
import { defaultResolvedThemeAppearance } from '../theming/appearance';
import { getFlexSourceTokens, getThemeAppearanceCache } from '../theming/themeRuntime';
import type { ThemeSource } from '../theming/themeSource';
import type { NormalizedThemeAppearance } from '../types/appearance.types';
import type { ThemeState } from '../types/themeState.types';

export const defaultThemeState: ThemeState = {
  tokens: defaultFlexTokens,
  appearance: defaultResolvedThemeAppearance,
  highContrast: false,
  themeStyles: {},
};

/**
 * Resolve Flex tokens for any source. Legacy sources use the forward adapter.
 */
export function getFlexTokens(source: ThemeSource, appearance: Readonly<NormalizedThemeAppearance>): FlexTokens {
  if (source.kind === 'flex') {
    return getFlexSourceTokens(source, appearance);
  }

  const cache = getThemeAppearanceCache(source, appearance);
  if (!cache.flexTokens) {
    cache.flexTokens = flexTokensFromTheme(source.resolveTheme(appearance), appearance);
  }
  return cache.flexTokens;
}

/**
 * Return the shared theme state for one source revision and resolved
 * appearance. Every new state owns a fresh style registry.
 */
export function getThemeState(source: ThemeSource, appearance: Readonly<NormalizedThemeAppearance>): ThemeState {
  const cache = getThemeAppearanceCache(source, appearance);
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
