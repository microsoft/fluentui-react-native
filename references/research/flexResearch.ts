/**
 * A list of component use cases for the agentic components.
 * - the component names are either in <Component> or <Component>.<Variant> format.
 * - variants can be things like appearance, size, etc.
 * - if all component variants of that type use the same value, they should be compressed to just <Component>.
 */
export type UserList = string[];

export type ColorUsers = {
  /**
   * An array of interactive users. These are users that use the hover, pressed variants of the color.
   * - if the usage is variant specific it can be listed as button.subtle to disambiguate, if used by all variants they should be compressed to just the root component.
   * - static users only use the default variant of the color.
   */
  interactive: UserList;

  /**
   * An array of static users. These are users that only use the default variant of the color or where the value stays constant across hover and press
   */
  static: UserList;
};

/**
 * Mapping of colors between backgrounds, foregrounds, and strokes in the flex designs.
 */
export type FlexColorMap = {
  /** foreground colors for the background color they are used on. */
  bgToFg: Record<string, Record<string, ColorUsers>>;
  /** stroke colors for the background color they are used on. */
  bgToStroke: Record<string, Record<string, ColorUsers>>;
  /** background colors for the foreground color they are used on. */
  fgToBg: Record<string, Record<string, ColorUsers>>;
  /** background colors for the stroke color they are used on. */
  strokeToBg: Record<string, Record<string, ColorUsers>>;
};

export type FlexResearch = {
  /** Mapping of colors between backgrounds, foregrounds, and strokes in the flex designs. */
  colorMaps: FlexColorMap;

  /** Mapping of corner radius token name to user list. */
  corners: Record<string, UserList>;

  /**
   * Mapping of font value to user list. The font value should be in the form of:
   * <font-family-token>.<font-size-token>.<font-weight-token>.<line-height>
   * for unused values use an empty string but keep the separators.
   */
  fonts: Record<string, UserList>;

  /**
   * Mapping of padding horizonal and vertical to user list
   * - <padding-horizontal-token>.<padding-vertical-token>
   */
  paddings: Record<string, UserList>;

  /**
   * Mapping of which colors change on hover or press.
   * - this should be the list of bg, fg, stroke, where each value is omitted if static on hover or press
   * - disabled values should be omitted from this list
   * - components that don't change at all should be omitted from this list
   */
  interactivity: Record<string, UserList>;
};
