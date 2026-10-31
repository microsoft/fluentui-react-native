/**
 * Derived from the base name of an OfficePalette, fluent2 token name, or X3 flex token name. Interactive color names should ignore
 * rest if it is part of the name.
 */
export type InteractiveColor = {
  /**
   * The default color, when not interacting with the control.
   */
  rest: string;

  /** hover color if specified */
  hover?: string;
  /** pressed color if specified */
  pressed?: string;
  /** disabled color if specified */
  disabled?: string;
  /** selected color if specified */
  selected?: string;
  /** focused color if specified */
  focused?: string;

  /**
   * Other custom colors with the same prefix. Note that if there any specialized states that have
   * hover/pressed/disabled/etc. specified, that set should be split off as a new interactive color.
   * For example, if you have CtrlTextRest, CtrlTextHover, CtrlTextPressed, then CtrlTextBrandRest, and CtrlTextBrandHover, then
   * the brand colors should be split off as a new interactive color.
   *
   * If Light, Dark, HighContrast are present for a color, split those as separate interactive colors as well.
   */
  [key: string]: string | undefined;
};

/**
 * Control templates
 */
export type ControlTemplate = {
  /**
   * The name of the InteractiveColor to use for the background
   */
  bg?: string;
  /**
   * The name of the InteractiveColor to use for the foreground. This is typically used for text and often maps to
   * names like text, foreground, etc. In JavaScript styles this can also be undecorated 'color'.
   */
  fg?: string;
  /**
   * The name of the InteractiveColor to use for the stroke, generally applied to borders.
   */
  stroke?: string;

  /**
   * Other custom colors used by the control. These should be prefaced by the role if possible.
   * - A secondary text color might be named 'fg.secondary'
   * - A glyph color might be named 'fg.glyph'
   * - A secondary line color might be named 'stroke.secondary'
   */
  [key: `bg.${string}`]: string | undefined;
  [key: `fg.${string}`]: string | undefined;
  [key: `stroke.${string}`]: string | undefined;

  /**
   * Variant overrides for the control template. This might be a high contrast or dark override, or include different
   * presentations of components such as different badge or present variants.
   */
  variants?: Record<string, ControlTemplate>;
};

export type ControlColorMap = {
  /** Interactive colors used by the control templates. In alphabetical order */
  colors: Record<string, InteractiveColor>;
  /**
   * Control templates, in alphabetical order
   */
  templates: Record<string, ControlTemplate>;
};
