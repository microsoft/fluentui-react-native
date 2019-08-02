/**
 * Function which produces a partial theme using only a parent theme.
 *
 * Useful for themes which can be computationally created from a base theme.
 * For example, creating a monochromatic theme from a colorful theme, or
 * increasing contrast throuhgout a theme.
 */
export type IProcessTheme<TTheme, TPartialTheme> = (parentTheme: TTheme) => TPartialTheme;

/**
 * Function which resolves a theme + partial theme into a new theme
 */
export type IResolveTheme<TTheme, TPartialTheme> = (parent: TTheme, partial?: TPartialTheme) => TTheme;

/**
 * Events issued from the theme registry.
 */
export interface IThemeEventListener {
  /**
   * Called when a theme is invalidated.
   *
   * This happens when one or more of its parent themes is invalidated or
   * changed. Any theme objects matching this name should be discarded. The
   * updated theme can be retrieved from the registry, when needed.
   *
   * `name` identifies the invalid theme. A blank name refers to the default
   * theme.
   */
  onInvalidate(name: string): void;
}

/**
 * A hierarchical collection of themes.
 */
export interface IThemeRegistry<TTheme, TPartialTheme> {
  /**
   * Get a theme using `name`.
   *
   * When `name` is missing or blank, the default theme is retrieved.
   */
  getTheme(name?: string): TTheme;

  /**
   * Add or update a theme.
   *
   * `definition` _indirectly_ defines the theme. It is either a partial theme
   * or a function that produces a partial theme using the parent theme. Either
   * way, the partial theme is combined with its parent to produce a resolved
   * theme.
   *
   * `name` identifies the theme in the registry. When missing or blank, the
   * default theme is used.
   *
   * `parent` identifies the parent theme. When missing or blank, the default
   * theme is used.
   */
  setTheme(definition: TPartialTheme | IProcessTheme<TTheme, TPartialTheme>, name?: string, parent?: string): void;

  /**
   * Listen for theming events.
   */
  addEventListener(events: IThemeEventListener): void;

  /**
   * Stop listening for theming events. Use the same object here that was used
   * when calling `addEventListener`.
   */
  removeEventListener(events: IThemeEventListener): void;

  /**
   * Update the _hidden_ root platform theme using `platformDefaults`.
   *
   * **NOTE**: Only the native platform should call this method.
   */
  updatePlatformDefaults(platformDefaults: TPartialTheme): void;
}
