import { ICachedPropHandlers } from './Token.internal';

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
export type ILookupThemePart<TTheme> = (theme: TTheme) => object;

/**
 * The logic for a given operation.  This does not include slot targeting as that is component specific.  That
 * is mapped separately so these object can be reused.
 */
export interface IStyleFactoryOperation<TTokens, TTheme> {
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
  lookup?: ILookupThemePart<TTheme>;
}
export type IOperationSet<TTokens, TTheme> = IStyleFactoryOperation<TTokens, TTheme>[];

/**
 * A style factory function takes token props and a theme and returns a partial props + style to be mixed in
 * to the token processing results.
 *
 * _keys - should specify the token keys the function is dependent on, required to cache properly
 */
export type IStyleFactoryFunctionRaw<TProps, TTokens, TTheme> = (
  tokenProps: TTokens,
  theme: TTheme,
) => TProps extends object ? TProps : never;
export type IStyleFactoryFunction<TProps, TTokens, TTheme> = IStyleFactoryFunctionRaw<TProps, TTokens, TTheme> & {
  _keys: (keyof TTokens)[];
};

/**
 * An entry can be an individual operation, an array of operations, or a token function
 */
export type IStyleFactoryEntry<TProps, TTokens, TTheme> =
  | IStyleFactoryOperation<TTokens, TTheme>
  | IOperationSet<TTokens, TTheme>
  | IStyleFactoryFunction<TProps, TTokens, TTheme>;

/**
 * This is the collection of style factories corresponding to the slots
 */
export type IStyleFactories<TSlotProps extends object, TTokens, TTheme> = {
  [K in keyof TSlotProps]?: IStyleFactoryEntry<TSlotProps[K], TTokens, TTheme> | IStyleFactoryEntry<TSlotProps[K], TTokens, TTheme>[];
};

/**
 * Callback function for a component to allow querying whether a given token is supported on a sub-component.  In
 * the case of token operations if a sub-component supports this token value it will be transferred to that component
 * rather than built into a style
 */
export type ITargetHasToken = (target: string, key: string) => boolean;

/**
 * Style finalizer function.  Allows transforming props and styles before they are cached.  This could be used
 * to create css rules for the styles and changing the reference to be by class name
 */
export type IStyleFinalizer<TProps> = (props: TProps, slotName: string) => TProps;

/**
 * Resolved token definitions, ready to be rendered
 */
export interface IComponentTokens<TSlotProps extends object, TTokens, TTheme> {
  /** handlers to process the props of each slot */
  handlers: ICachedPropHandlers<TSlotProps, TTokens, TTheme>;

  /** token keys put into a map for both ordered retrieval and quick lookups */
  tokenKeys: { [key: string]: undefined };
}
