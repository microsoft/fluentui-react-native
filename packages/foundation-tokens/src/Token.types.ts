import { IComponentSettings } from '@uifabric/theme-settings';

/**
 * TOKEN PROCESSING FUNCTIONS
 *
 * The following types for writing handlers for token values.  At its core the token system runs through a
 * series of processing functions.  These function take tokenProps and theme and produce a partial slot props or
 * component settings object.
 */

/**
 * A converter function which turns token properties into settings.  Note that this doesn't get input into
 * the system directly, it gets _keys appended to it.
 *
 * @param tokenProps - the set of props which include the token values (if set)
 * @param theme - the current theme for this component
 */
export type ITokenFunction<TProps, TTheme = object> = (tokenProps: TProps, theme: TTheme) => IComponentSettings | undefined;

/**
 * Additional data attached to a token function, in particular the set of keys are necessary to effectively
 * cache the component.  If a processor function depends upon undeclared keys it may not re-resolve.
 */
export interface ITokenFunctionData<TProps> {
  _keys: (keyof TProps)[];
}

/** Combined type, use setupTokenProcessor to make it easy to create this */
export type ITokenProcessor<TProps, TTheme = object> = ITokenFunction<TProps, TTheme> & ITokenFunctionData<TProps>;

/**
 * TOKEN OPERATIONS (PARTIAL TOKEN PROCESSORS)
 *
 * Because in many cases the handling for tokens is the same, namely:
 * - copying to a target style
 * - transferring to a sub-component's tokens
 * - renaming the value
 * - looking up a value in a theme part
 * - some combination of these
 *
 * Token operations allow defining the actions to apply to a given token.  These will be built up by the
 * framework into a processor function when the component is defined.
 */

/** function which takes a theme and returns an object to look up a value with (t) => t.palette as an example */
export type ILookupThemePart<TTheme> = (theme: TTheme) => object;

/**
 * The logic for a given operation.  This does not include slot targeting as that is component specific.  That
 * is mapped separately so these object can be reused.
 */
export interface ITokenOperation<TProps, TTheme> {
  /**
   * key to look up in the token prop to get the definition of the token
   */
  source: keyof TProps;

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

/**
 * A component specific set of operations to map to a set of slots
 */
export interface ITokenOperations<TProps, TTheme> {
  mapping: ITokenOperation<TProps, TTheme>[];
  slots: string[];
}

/**
 * COMPONENT DEFINITIONS
 *
 * A component provides an array of processors or operations that will get processed at render time.  Individual
 * operations will be processed at component definition time and wrapped in processor functions.
 */

/** Combination type for operations or processor */
export type ITokenInputEntry<TProps, TTheme> = ITokenOperations<TProps, TTheme> | ITokenProcessor<TProps, TTheme>;

/**
 * The format for defining the tokens of a component.  An array of processors and operations to perform.
 *
 * Note that order will be maintained but one generated processor will be created for each chunk.  So the
 * following input array:
 *  [...3 operations, processor, ...2 operations, processor, ...5 operations]
 * will have each chunk of operations replaced with a generated function.
 *
 * As a result it is somewhat more efficient to group these if order doesn't matter.
 */
export type IComponentTokenDefinitions<TProps, TTheme> = ITokenInputEntry<TProps, TTheme>[];

/**
 * Callback function for a component to allow querying whether a given token is supported on a sub-component.  In
 * the case of token operations if a sub-component supports this token value it will be transferred to that component
 * rather than built into a style
 */
export type ITargetHasToken = (target: string, key: string) => boolean;

/**
 * Resolved token definitions, ready to be rendered
 */
export interface IComponentTokens<TProps, TTheme> {
  /** all operations combined into token processors */
  tokens: ITokenProcessor<TProps, TTheme>[];

  /** token keys put into a map for both ordered retrieval and quick lookups */
  tokenKeys: Map<string, boolean>;
}
