import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from './tokens/flex.types';
import { useFlexTokens } from './tokens/useFlexTokens';

export type ThemeStyleSheet = Record<string, ViewStyle | TextStyle | ImageStyle>;

export type ThemeState = {
  /**
   * The set of flex tokens
   */
  readonly tokens: FlexTokens;
  /**
   * Whether the system is in high contrast mode
   */
  readonly highContrast: boolean;
  /**
   * Style sheets shared by every component instance using this theme state.
   *
   * Components should use a module-scoped symbol as their key and lazily store
   * one immutable StyleSheet.create result whose values depend only on this
   * ThemeState. Component props, interaction state, and user styles must be
   * applied separately.
   */
  readonly themeStyles: Record<symbol, ThemeStyleSheet>;
};

/**
 * Theme state should be consistent on object identity until a theme change or system appearance change occurs. Each new
 * theme state must own a new themeStyles registry so cached style sheets cannot leak across themes.
 */
const defaultThemeState: ThemeState = {
  tokens: useFlexTokens(),
  highContrast: false,
  themeStyles: {},
};

/**
 * Placeholder hook for accessing the current theme state. The theme state should have consistent object identity
 * until a theme change or system appearance change occurs so it can be used as a memo key.
 *
 * @returns The current theme state, including flex tokens, high contrast mode status, and shared theme style sheets.
 */
export function useThemeState(): ThemeState {
  return defaultThemeState;
}

/**
 * Returns the style sheet cached for a component under the current theme,
 * creating it on first use.
 */
export function getThemeStyleSheet<TStyles extends ThemeStyleSheet>(
  themeState: ThemeState,
  key: symbol,
  createStyles: (themeState: ThemeState) => TStyles,
): TStyles {
  const cachedStyles = themeState.themeStyles[key] as TStyles | undefined;
  if (cachedStyles) {
    return cachedStyles;
  }

  const styles = createStyles(themeState);
  themeState.themeStyles[key] = styles;
  return styles;
}

/**
 * Creates a themed style sheet factory for a component. This provides a function which will return a style sheet from
 * the theme state and ensure it is only created once per instance of the ThemeState object.
 *
 * @param symbolName A unique name for the component, used to create a symbol key.
 * @param factory A function that creates the theme style sheet for the component.
 * @returns A function that retrieves the cached theme style sheet for the component, creating it if necessary.
 */
export function themedStyleSheetFactory<TStyles extends ThemeStyleSheet>(symbolName: string, factory: (themeState: ThemeState) => TStyles) {
  // key should be unique per component, stored with the closure so that the same key is used for every instance of the component
  const key = Symbol(symbolName);
  return (themeState: ThemeState) => {
    return (themeState.themeStyles[key] ??= factory(themeState));
  };
}
