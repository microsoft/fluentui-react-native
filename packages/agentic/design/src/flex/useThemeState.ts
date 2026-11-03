import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import type { ThemeSourceContextValue } from '../theming/context';
import { useThemeBoundary } from '../theming/context';
import { getThemeState } from './themeState';
import type { ThemeAppearanceState } from '../types/appearance.types';
import type { ThemeState } from './themeState.types';

export type ThemeStyleSheet = Record<string, ViewStyle | TextStyle | ImageStyle>;

function useRequiredThemeBoundary(hookName: string): ThemeSourceContextValue {
  const boundary = useThemeBoundary();
  if (!boundary) {
    throw new Error(
      `${hookName} requires a theme. Render the component inside a ThemedRoot or ThemeProvider; in tests, use the ` +
        `helpers from '@fluentui-react-native/design/testing/theme'.`,
    );
  }
  return boundary;
}

/**
 * Theme state should be consistent on object identity until a theme change or system appearance change occurs. Each new
 * theme state must own a new themeStyles registry so cached style sheets cannot leak across themes.
 */
/**
 * Access the current theme state. Every consumer of the same source revision
 * and resolved appearance shares one state identity.
 *
 * @returns The current theme state, including flex tokens, high contrast mode status, and shared theme style sheets.
 * @throws When no `ThemeProvider`, `ThemedRoot`, or legacy theme context is above the caller.
 */
export function useThemeState(): ThemeState {
  const boundary = useRequiredThemeBoundary('useThemeState');
  return getThemeState(boundary.source, boundary.appearance.resolved);
}

/**
 * Access both the requested appearance and its concrete resolution.
 *
 * @throws When no `ThemeProvider`, `ThemedRoot`, or legacy theme context is above the caller.
 */
export function useThemeAppearance(): Readonly<ThemeAppearanceState> {
  return useRequiredThemeBoundary('useThemeAppearance').appearance;
}

/**
 * Creates a themed style sheet factory for a component. This provides a function which will return a style sheet from
 * the theme state and ensure it is only created once per instance of the ThemeState object.
 *
 * @param symbolName A unique name for the component, used to create a symbol key.
 * @param factory A function that creates the theme style sheet for the component.
 * @returns A function that retrieves the cached theme style sheet for the component, creating it if necessary.
 */
export function themedStyleSheetFactory<TStyles extends ThemeStyleSheet>(
  symbolName: string,
  factory: (themeState: ThemeState) => TStyles,
): (themeState: ThemeState) => TStyles {
  // key should be unique per component, stored with the closure so that the same key is used for every instance of the component
  const key = Symbol(symbolName);
  return (themeState: ThemeState) => {
    const cachedStyles = themeState.themeStyles[key] as TStyles | undefined;
    if (cachedStyles) {
      return cachedStyles;
    }

    const styles = factory(themeState);
    themeState.themeStyles[key] = styles;
    return styles;
  };
}
