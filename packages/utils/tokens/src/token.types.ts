/**
 * STYLE FACTORY OPERATIONS (PARTIAL TOKEN PROCESSORS)
 *
 * Because in many cases the handling for tokens is the same, namely:
 * - copying to a target style
 * - transferring to a sub-component's tokens
 * - renaming the value
 * - looking up a value in a theme part
 * - some combination of these
 *
 * Style factory operations allow defining the actions to apply to a given token.  These will be built up by the
 * framework into a processor function when the component is defined.
 */

/** function which takes a theme and returns an object to look up a value with `(t) =>` t.palette as an example */
export type LookupThemePart<TTheme> = (theme: TTheme) => object;

/**
 * The logic for a given operation.  This does not include slot targeting as that is component specific.  That
 * is mapped separately so these object can be reused.
 */
export interface StyleFactoryOperation<TTokens, TTheme> {
  /**
   * key to look up in the token prop to get the definition of the token
   */
  source: keyof TTokens;

  /**
   * key to use to enter the resolved token in the style.  If omitted this will be the same as the key.
   */
  target?: string;

  /**
   * lookup function to return a theme part.  If specified the processor will attempt to use the token value as
   * an index into this object (if the value is a string), if that resolves successfully the token value will be
   * replaced with the value from the theme.  If this is omitted the token value will simply be copied as-is
   */
  lookup?: LookupThemePart<TTheme>;
}
export type OperationSet<TTokens, TTheme> = StyleFactoryOperation<TTokens, TTheme>[];

/**
 * A style factory function takes token props and a theme and returns a partial props + style to be mixed in
 * to the token processing results.
 *
 * _keys - should specify the token keys the function is dependent on, required to cache properly
 */
export type StyleFactoryFunctionRaw<TProps, TTokens, TTheme> = (
  tokenProps: TTokens,
  theme: TTheme,
) => TProps extends object ? TProps : never;

export type StyleFactoryFunction<TProps, TTokens, TTheme> = StyleFactoryFunctionRaw<TProps, TTokens, TTheme> & {
  _keys: (keyof TTokens)[];
};
