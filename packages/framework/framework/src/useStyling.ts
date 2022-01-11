/**
 * Many of the types from use-styling take a theme as a type parameter. This re-exports them in such a way
 * as to be dependent on the core theme type
 */
export { TokensThatAreAlsoProps, HasLayer, UseStyling } from '@fluentui-react-native/use-styling';
import {
  TokensFromTheme as TokensFromThemeBase,
  TokenSettings as TokenSettingsBase,
  UseStylingOptions as UseStylingOptionsBase,
  buildUseStyling as buildUseStylingBase,
  UseStyling,
  buildProps as buildPropsBase,
  BuildPropsBase,
} from '@fluentui-react-native/use-styling';
import { Theme } from '@fluentui-react-native/theme-types';
import { themeHelper } from './themeHelper';

export type BuildProps<TProps, TTokens> = BuildPropsBase<TProps, TTokens, Theme>;

export function buildProps<TProps, TTokens>(
  fn: (tokens: TTokens, theme: Theme) => TProps,
  keys?: (keyof TTokens)[],
): BuildProps<TProps, TTokens> {
  return buildPropsBase<TProps, TTokens, Theme>(fn, keys);
}

export type TokensFromTheme<TTokens> = TokensFromThemeBase<TTokens, Theme>;
export type TokenSettings<TTokens> = TokenSettingsBase<TTokens, Theme>;
export type UseStylingOptions<TProps, TSlotProps, TTokens> = UseStylingOptionsBase<TProps, TSlotProps, TTokens, Theme>;

/**
 * Construct a useStyling hook which returns styled slot props based on props and tokens defined in options and in the theme
 *
 * @param options - options which drive behavior for the generated styling hook
 */
export function buildUseStyling<TProps, TSlotProps, TTokens>(
  options: UseStylingOptions<TProps, TSlotProps, TTokens>,
): UseStyling<TProps, TSlotProps> {
  // create a cache instance for this use styling implementation
  return buildUseStylingBase(options, themeHelper);
}
