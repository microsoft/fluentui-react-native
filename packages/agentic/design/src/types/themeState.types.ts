import type { FlexTokens } from '../flex/tokens.types';
import type { ResolvedThemeAppearance } from './appearance.types';

/**
 * Style sheets cached for one theme state, keyed by a module-scoped symbol per component.
 */
export type ThemeStyleRegistry = Record<symbol, unknown>;

export type ThemeState = {
  /**
   * The set of flex tokens
   */
  readonly tokens: FlexTokens;
  /**
   * Structured appearance values used to resolve this theme state.
   */
  readonly appearance: Readonly<ResolvedThemeAppearance>;
  /**
   * @deprecated Use appearance.contrast.
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
  readonly themeStyles: ThemeStyleRegistry;
};
