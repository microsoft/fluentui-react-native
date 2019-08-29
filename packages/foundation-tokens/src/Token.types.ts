import { IComponentSettings } from '@uifabric/theme-settings';

/**
 * TOKEN PROCESSING FUNCTIONS
 *
 * The following types for writing handlers for token values.  At its core the token system runs through a
 * series of processing functions.  These function take tokenProps and theme and produce a partial slot props or
 * component settings object.
 *
 * Because in many cases the handling for tokens is the same, namely:
 * - copying to a target style
 * - transferring to a sub-component's tokens
 * - renaming the value
 * - looking up a value in a theme part
 * - some combination of these
 * There are affordances for generating a processor function for these sort of standard operations
 */

export type ILookupThemePart<TTheme> = (theme: TTheme) => object;

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
 * In the case where standard processing is desireable this defines the core bit of logic.  Note that the slot target
 * is defined externally so that the standard entries here don't need to be recreated for every control type
 */
export interface ITokenKeyLogic<TProps, TTheme> {
  /**
   * key to look up in the token prop to get the definition of the token
   */
  key: keyof TProps;

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
 * For a given component definition this defines the set of mappings as well as what slot the set of mappings should
 * target.
 */
export interface ITokenKeyLogicSet<TProps, TTheme> {
  mapping: ITokenKeyLogic<TProps, TTheme>[];
  slots: string[];
}

/**
 * The combination type between the two
 */
export type ITokenInputEntry<TProps, TTheme> = ITokenKeyLogicSet<TProps, TTheme> | ITokenProcessor<TProps, TTheme>;

/**
 * The format for defining the tokens of a component.  This can be a combination of token processors and logic for individual
 * tokens.
 */
export type IComponentTokenDefinitions<TProps, TTheme> = ITokenInputEntry<TProps, TTheme>[];

export type ITargetHasToken = (target: string, key: string) => boolean;

/**
 * Fragment of a component that is ready to process tokens
 */
export interface IComponentTokens<TProps, TTheme> {
  tokens: ITokenProcessor<TProps, TTheme>[];
  tokenKeys: Map<string, boolean>;
}
