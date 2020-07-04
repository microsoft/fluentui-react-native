export { TokenPropMask, WithLayers, HasLayer, applyTokenLayers, UseStyling } from '@fluentui-react-native/use-styling';
import {
  StyleFunction as StyleFunctionBase,
  RefineFunction as RefineFunctionBase,
  RefinableStyleFunction as RefinableStyleFunctionBase,
  StyleFunctions as StyleFunctionsBase,
  styleFunction as styleFunctionBase,
  TokensFromTheme as TokensFromThemeBase,
  TokenSettings as TokenSettingsBase,
  UseStylingOptions as UseStylingOptionsBase,
  buildUseStyling as buildUseStylingBase,
  UseStyling
} from '@fluentui-react-native/use-styling';
import { ITheme } from '@uifabricshared/theming-ramp';
import { themeHelper } from './themeHelper';

export type StyleFunction<TProps, TTokens> = StyleFunctionBase<TProps, TTokens, ITheme>;
export type RefineFunction<TProps, TTokens> = RefineFunctionBase<TProps, TTokens, ITheme>;
export type RefinableStyleFunction<TProps, TTokens> = RefinableStyleFunctionBase<TProps, TTokens, ITheme>;
export type StyleFunctions<TSlotProps, TTokens> = StyleFunctionsBase<TSlotProps, TTokens, ITheme>;

export function styleFunction<TProps, TTokens>(
  fn: (tokens: TTokens, theme: ITheme) => TProps,
  keys?: (keyof TTokens)[]
): RefinableStyleFunction<TProps, TTokens> {
  return styleFunctionBase<TProps, TTokens, ITheme>(fn, keys);
}

export type TokensFromTheme<TTokens> = TokensFromThemeBase<TTokens, ITheme>;
export type TokenSettings<TTokens> = TokenSettingsBase<TTokens, ITheme>;
export type UseStylingOptions<TProps, TSlotProps, TTokens> = UseStylingOptionsBase<TProps, TSlotProps, TTokens, ITheme>;

/**
 * Construct a useStyling hook which returns styled slot props based on props and tokens defined in options and in the theme
 *
 * @param options - options which drive behavior for the generated styling hook
 */
export function buildUseStyling<TProps, TSlotProps, TTokens>(
  options: UseStylingOptions<TProps, TSlotProps, TTokens>
): UseStyling<TProps, TSlotProps> {
  // create a cache instance for this use styling implementation
  return buildUseStylingBase(options, themeHelper);
}
