import { getMemoCache, GetMemoValue } from '@fluentui-react-native/memo-cache';
import { immutableMerge } from '@fluentui-react-native/immutable-merge';
import { TokensThatAreAlsoProps, BuildSlotProps, refinePropsFunctions } from './buildProps';
import { HasLayer, applyTokenLayers } from './applyTokenLayers';

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
 * Options used to build up a useStyling hook
 */
export type UseStylingOptions<TProps, TSlotProps, TTokens, TTheme> = {
  /**
   * Baseline tokens for this component
   */
  tokens?: TokenSettings<TTokens, TTheme>[];

  /**
   * States that might be applied for the component like disabled or hovered, these should be listed
   * in the order that they should be applied
   */
  states?: (keyof TTokens)[];

  /**
   * Functions which build up the props for each slot
   */
  slotProps?: BuildSlotProps<TSlotProps, TTokens, TTheme>;

  /**
   * Which props should be considered to be tokens.
   * - If an array of keys this will ensure these props are promoted to tokens
   * - If true all props will be added to tokens, if false or not specified no props will be treated as tokens
   */
  tokensThatAreAlsoProps?: TokensThatAreAlsoProps<TTokens>;

  /** purely used to make type inferencing work correctly so the hook builder can pick up TProps from this type */
  _propsType?: TProps;
};

/**
 * Signature for the use styling hook
 */
export type UseStyling<TProps, TSlotProps> = (props: TProps, lookup?: HasLayer) => TSlotProps;

/**
 * Helper object which injects theme specific functionality
 */
export type ThemeHelper<TTheme> = {
  /** query the theme from the context, or from a global if your system doesn't use theming */
  useTheme: () => TTheme;

  /** lookup info for the component in the theme */
  getComponentInfo: (theme: TTheme, name: string) => any;
};

/**
 * This the merges [all/some/no] props into tokens based on tokenProps being [true/[key1, key2]/false] respectively. If
 * tokens is modified it returns a new object rather than modifying the tokens object itself
 *
 * @param tokens - set of tokens that are coming from the theme
 * @param props - input props for the component
 * @param tokenProps - how to merge props into tokens. If true all props will be merged, false: no props, an array of keys will
 *                     be treated as an include mask
 */
function promotePropsToTokens<TTokens, TProps>(tokens: TTokens, props: TProps, tokenProps?: TokensThatAreAlsoProps<TTokens>): TTokens {
  return tokenProps && tokenProps !== 'none'
    ? {
        ...tokens,
        ...(typeof tokenProps === 'object' && Array.isArray(tokenProps)
          ? Object.assign(
              {},
              ...tokenProps.filter((key) => props[key as string] !== undefined).map((key) => ({ [key]: props[key as string] })),
            )
          : props),
      }
    : tokens;
}

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
  getComponentInfo: ThemeHelper<TTheme>['getComponentInfo'],
): object {
  if (typeof tokenEntry === 'string') {
    tokenEntry = getComponentInfo(theme, tokenEntry);
  }
  if (typeof tokenEntry === 'function') {
    tokenEntry = (tokenEntry as TokensFromTheme<TTokens, TTheme>)(theme);
  }
  return (tokenEntry as unknown) as object;
}

/**
 * Produce the final slot props for the styled hook
 *
 * @param styles - refined style functions or props to use for processing
 * @param tokens - token inputs for the style functions
 * @param theme - theme to resolve against
 * @param cache - cache to use for the base of slot caching
 */
function resolveToSlotProps<TSlotProps, TTokens, TTheme>(
  styles: BuildSlotProps<TSlotProps, TTokens, TTheme>,
  tokens: TTokens,
  theme: TTheme,
  cache: GetMemoValue<TTokens>,
): TSlotProps {
  const slotProps = {};
  Object.keys(styles).forEach((key) => {
    const style = styles[key];
    slotProps[key] = typeof style === 'function' ? style(tokens, theme, cache(null, [key])[1]) : style;
  });
  return slotProps as TSlotProps;
}

/**
 * Construct a useStyling hook which returns styled slot props based on props and tokens defined in options and in the theme
 *
 * @param options - options which drive behavior for the generated styling hook
 * @param themeHelper - injected theme functionality
 */
export function buildUseStyling<TProps, TSlotProps, TTokens, TTheme>(
  options: UseStylingOptions<TProps, TSlotProps, TTokens, TTheme>,
  themeHelper: ThemeHelper<TTheme>,
): UseStyling<TProps, TSlotProps> {
  // create a cache instance for this use styling implementation
  const cache = getMemoCache();
  const { useTheme, getComponentInfo } = themeHelper;
  const { tokens, tokensThatAreAlsoProps: tokenProps } = options;
  const styles = refinePropsFunctions(options.slotProps || {}, tokenProps);

  return (props: TProps, lookup?: HasLayer) => {
    // query the theme
    const theme = useTheme();

    // get the base styles all merged together, these will only depend on internal tokens and theme
    const [merged, subCache] = cache(() => immutableMerge(...tokens.map((value) => mapToTokens(value, theme, getComponentInfo))), [theme]);

    // resolve overrides as appropriate
    const [layered, cacheBase] = options.states
      ? applyTokenLayers(merged, options.states as string[], subCache, lookup || ((val) => props[val]))
      : [merged, subCache];

    // now resolve tokens
    const finalTokens = promotePropsToTokens(layered, props, tokenProps);

    // finally produce slotProps from calling the style functions on each entry
    return resolveToSlotProps(styles, finalTokens, theme, cacheBase);
  };
}
