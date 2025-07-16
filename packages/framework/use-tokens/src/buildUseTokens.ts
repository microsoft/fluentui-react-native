import { immutableMerge } from '@fluentui-react-native/framework-base';
import type { GetMemoValue } from '@fluentui-react-native/framework-base';
import { getMemoCache } from '@fluentui-react-native/framework-base';

/** A function to generate tokens based on a theme */
export type TokensFromTheme<TTokens, TTheme> = (theme: TTheme) => TTokens;

/**
 * Types of tokens, can be:
 * - string - will lookup the name in the theme
 * - Tokens - will merge the tokens in directly
 * - Function - will run against the theme once for each unique theme encountered
 */
export type TokenSettings<TTokens, TTheme> = string | TTokens | TokensFromTheme<TTokens, TTheme>;

/**
 * The main signature of a useTokens hook is to take the theme and produce a set of resolved tokens,
 * as well as a sub-cache, specific to this particular theme, that can be used for caching various styles
 * or values that are theme specific
 */
export type UseTokensCore<TTokens, TTheme> = (theme: TTheme) => [TTokens, GetMemoValue<TTokens>];

/**
 * The full signature also includes a customize function that returns an updated version of useTokens
 * that captures both the previous values, and layers in the new values specified
 */
export type UseTokens<TTokens, TTheme> = UseTokensCore<TTokens, TTheme> & {
  customize: (...tokens: TokenSettings<TTokens, TTheme>[]) => UseTokens<TTokens, TTheme>;
};

/**
 * Helper function that knows how to try to look up token information from the theme
 */
export type GetComponentInfo<TTokens, TTheme> = (theme: TTheme, name: string) => TTokens | TokensFromTheme<TTokens, TTheme>;

/**
 * Tokens are defined as either:
 *   TTokens     - an object
 *   string      - a name to look up in the theme
 *   function    - a function to run against the theme to produce tokens
 *
 * This function maps any of these types into a specific TTokens object.  A string is first lookup up in the theme, returning a function
 * or object. If the type is a function this will be invoked with the theme to generate the tokens object.
 *
 * @param tokenEntry - token entry to start with
 * @param theme - theme to use for queries
 * @param getComponentInfo - helper to use to lookup the component in the theme
 */
function mapToTokens<TTokens, TTheme>(
  tokenEntry: TTokens | string | TokensFromTheme<TTokens, TTheme>,
  theme: TTheme,
  getComponentInfo: GetComponentInfo<TTokens, TTheme> | undefined,
): object {
  if (typeof tokenEntry === 'string') {
    tokenEntry = (getComponentInfo && (getComponentInfo(theme, tokenEntry) as TTokens)) || ({} as TTokens);
  }
  if (typeof tokenEntry === 'function') {
    tokenEntry = (tokenEntry as TokensFromTheme<TTokens, TTheme>)(theme);
  }
  return tokenEntry as unknown as object;
}

/**
 * Construct a useStyling hook which returns styled slot props based on props and tokens defined in options and in the theme
 *
 * @param options - options which drive behavior for the generated styling hook
 * @param themeHelper - injected theme functionality
 */
export function buildUseTokens<TTokens, TTheme>(
  getComponentInfo: GetComponentInfo<TTokens, TTheme> | undefined,
  ...tokens: TokenSettings<TTokens, TTheme>[]
): UseTokens<TTokens, TTheme> {
  // create a cache instance for use in this particular call to buildUseTokens
  const cache = getMemoCache();

  // the core function simply merges layers together, looking up component definitions in the theme as well as executing any
  // theme functions. This turns the tokens into an array of token objects that then get merged together
  const useTokensCore = (theme: TTheme) => {
    // get the base styles all merged together, these will only depend on internal tokens and theme
    return cache(() => immutableMerge(...tokens.map((value) => mapToTokens(value, theme, getComponentInfo))), [theme]);
  };

  // attach a customize function to generate a new use
  useTokensCore.customize = (...newTokens: TokenSettings<TTokens, TTheme>[]) => {
    const mergedTokens = [...tokens, ...newTokens];
    return buildUseTokens<TTokens, TTheme>(getComponentInfo, ...mergedTokens);
  };

  return useTokensCore;
}
