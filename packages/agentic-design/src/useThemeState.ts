import type { FlexTokens } from './tokens/flex.types';
import { useFlexTokens } from './tokens/useFlexTokens';

export type ThemeState = {
  /**
   * The set of flex tokens
   */
  readonly tokens: FlexTokens;
  /**
   * Whether the system is in high contrast mode
   */
  readonly highContrast: boolean;
};

/**
 * Theme state should be consistent on object identity until a theme change or system appearance change occurs.
 */
const defaultThemeState: ThemeState = {
  tokens: useFlexTokens(),
  highContrast: false,
};

/**
 * Placeholder hook for accessing the current theme state. The theme state should have consistent object identity
 * until a theme change or system appearance change occurs so it can be used as a memo key.
 *
 * @returns The current theme state, including flex tokens and high contrast mode status.
 */
export function useThemeState(): ThemeState {
  return defaultThemeState;
}
