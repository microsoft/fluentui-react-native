export type ILookupThemePart<TTheme> = (theme: TTheme) => object;

/**
 * Configure standard token processor entries for using defineTokenProcessor to build token functions
 */
export interface ITokenProcessorDefinitionEntry<TProps extends object, TTheme> {
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
 * Not all tokens map directly (e.g. tokens.color to style.color), some involve renaming like an iconColor or a
 * captionColor token.
 */
export interface ITokenMapping<TProps = object> {
  source: keyof TProps;
  target: string;
}

/**
 * The key of a token, which can be either a string or a mapping in the case where source !== target
 */
export type ITokenKey<TProps = object> = (keyof TProps) | ITokenMapping;
