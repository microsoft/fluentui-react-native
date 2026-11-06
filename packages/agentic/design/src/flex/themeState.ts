import { Appearance } from 'react-native';

import { flexCoolTheme } from '../themes/flex/flexCoolTheme';
import { resolveFlexTokenDescription } from './colors/interactionPolicy';
import { flexTokensFromTheme } from './adapters/flexTokensFromTheme';
import type { FlexTokens } from './tokens.types';
import { resolveThemeAppearance } from '../theming/appearance';
import { getFlexSourceTokens, getThemeAppearanceCache } from '../theming/themeRuntime';
import type { ThemeSource } from '../theming/themeSource';
import type { NormalizedThemeAppearance } from '../types/appearance.types';
import type { ThemeState } from './themeState.types';

export const getDefaultThemeState = (() => {
  let state: ThemeState | undefined;
  return (): ThemeState => {
    if (!state) {
      const { resolved: appearance } = resolveThemeAppearance(undefined, { colorScheme: Appearance.getColorScheme() });
      state = {
        tokens: resolveFlexTokenDescription(flexCoolTheme.tokens, appearance),
        appearance,
        highContrast: false,
        themeStyles: {},
      };
    }
    return state;
  };
})();

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
