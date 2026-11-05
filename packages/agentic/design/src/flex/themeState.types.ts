import type { ColorTone, NormalizedThemeAppearance } from '../types/appearance.types';
import type { FlexTokenDescription, FlexTokens } from './tokens.types';

/**
 * A complete Flex theme: a token description that replaces the package
 * defaults, and the palette tone it was authored for.
 */
export type FlexThemeDescription = {
  /**
   * The complete authored token description, covering light and dark.
   */
  readonly tokens: FlexTokenDescription;
  /**
   * The palette tone of these tokens. A `FlexThemeReference` built on this
   * description uses it as its default requested tone, which also selects the
   * interaction-color algorithm. Omitted means no default, so the tone
   * resolves as for any other source.
   */
  readonly colorTone?: ColorTone;
};

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
  readonly appearance: Readonly<NormalizedThemeAppearance>;
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
