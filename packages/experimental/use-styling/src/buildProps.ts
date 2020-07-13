import { GetMemoValue } from '@fluentui-react-native/memo-cache';

/**
 * Denotes what props will be treated as tokens
 * - false | undefined : this means no properties should be treated as tokens
 * - true              : treat all props as tokens
 * - array of keys     : props matching that array should be treated as tokens
 */
export type TokenPropMask<TTokens> = (keyof TTokens)[] | boolean;

/**
 * Raw format for producing styles in a functional manner. These can only depend on tokens or theme as inputs.
 * - tokens:  these will be produced from the theme and component constants, then they will be potentially
 *            be modified by the props. See the TokenPropMask type for more details.
 * - theme:   the theme is provided for reference
 * The provided
 * cache will be scoped to the theme, slot, and tokens that are coming out of the theme.
 */
export type BuildPropsBase<TProps, TTokens, TTheme> = (tokens: TTokens, theme: TTheme, cache: GetMemoValue<any>) => Partial<TProps>;

/**
 * A refine function allows style functions to be updated based on tokens that are also props. Only those tokens that are also
 * props need to be considered as a key for caching
 */
export type RefineFunctionBase<TProps, TTokens, TTheme> = (mask?: TokenPropMask<TTokens>) => BuildPropsBase<TProps, TTokens, TTheme>;

/**
 * Signature for a style function which can be optionally refined by the styling hook if prop masks are provided
 */
export type RefinableBuildPropsBase<TProps, TTokens, TTheme> = BuildPropsBase<TProps, TTokens, TTheme> & {
  refine?: RefineFunctionBase<TProps, TTokens, TTheme>;
};

/**
 * Style functions can be plain functions, refinable functions, or just raw props
 */
export type BuildSlotProps<TSlotProps, TTokens, TTheme> = {
  [K in keyof TSlotProps]?: RefinableBuildPropsBase<TSlotProps[K], TTokens, TTheme> | TSlotProps[K]
};

function cacheStyleClosure<TProps, TTokens, TTheme>(
  fn: (tokens: TTokens, theme: TTheme) => TProps,
  keys?: (keyof TTokens)[]
): RefinableBuildPropsBase<TProps, TTokens, TTheme> {
  return (tokens: TTokens, theme: TTheme, cache: GetMemoValue<TProps>) =>
    cache(() => fn(tokens, theme), (keys || []).map(key => tokens[key]))[0];
}

function refineKeys<TTokens>(keys: (keyof TTokens)[], mask?: TokenPropMask<TTokens>): (keyof TTokens)[] {
  return typeof mask === 'object' && Array.isArray(mask) ? keys.filter(key => mask.findIndex(val => val === key) !== -1) : mask ? keys : [];
}

/**
 * Standard wrapper for a function that provides props for a component based on tokens and theme.
 *
 * @param fn - function which does the work of producing props for the tokens and theme provided
 * @param keys - which token properties are used by this style, this determines the keys to use for caching
 */
export function buildProps<TProps, TTokens, TTheme>(
  fn: (tokens: TTokens, theme: TTheme) => TProps,
  keys?: (keyof TTokens)[]
): RefinableBuildPropsBase<TProps, TTokens, TTheme> {
  // wrap the provided function in the standard caching layer, basing it upon the provided keys
  const result = cacheStyleClosure(fn, keys);

  // if results are being cached on keys, provide the ability to refine the function if a prop mask is specified
  result.refine =
    keys && keys.length > 0
      ? (mask?: TokenPropMask<TTokens>) => {
          return cacheStyleClosure(fn, refineKeys(keys, mask));
        }
      : undefined;

  // return the style function decorated with the refine function
  return result;
}

/**
 * Utility function to check the type and refinement capabilities of a styleFunction and refine it if appropriate
 *
 * @param fn - function or props to potentially refine
 * @param mask - prop mask to use for refinement
 */
export function refinePropsFunctions<TSlotProps, TTokens, TTheme>(
  styles: BuildSlotProps<TSlotProps, TTokens, TTheme>,
  mask: TokenPropMask<TTokens>
): BuildSlotProps<TSlotProps, TTokens, TTheme> {
  const result = {};
  Object.keys(styles).forEach(key => {
    const refine =
      typeof styles[key] === 'function' && (styles[key] as RefinableBuildPropsBase<TSlotProps[keyof TSlotProps], TTokens, TTheme>).refine;
    result[key] = refine ? refine(mask) : styles[key];
  });
  return result;
}
