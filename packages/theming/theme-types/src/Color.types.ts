/**
 * A color value.
 *
 * Color values are expressed using various formats, some of which are
 * unique to a platform.
 *
 * As a general guideline, CSS color syntax should work on all platforms. See
 * https://reactnative.dev/docs/colors for more details.
 *
 * An example of a platform-specific color is a MacOS semantic color:
 *
 * `{semantic: "windowBackgroundColor"}`
 */

import { ColorValue } from 'react-native';

export type ThemeColorDefinition = Palette & {
  background: ColorValue;
  bodyText: ColorValue;
  subText: ColorValue;
  disabledText: ColorValue;
  [key: string]: ColorValue;
};

export interface FabricWebPalette {
  // ROLE: Themed text
  // linkHovered
  themeDarker: ColorValue;

  // ROLE: Themed background
  // primaryButtonBackgroundPressed
  themeDark: ColorValue;

  // ROLE: Themed background
  // inputBackgroundCheckedHovered, primaryButtonBackgroundHovered
  themeDarkAlt: ColorValue;

  // ROLE: Themed background, border, text
  // inputBackgroundChecked, inputFocusBorderAlt, primaryButtonBackground, menuIcon, menuHeader, link
  themePrimary: ColorValue;

  // unused
  themeSecondary: ColorValue;

  // unused
  themeTertiary: ColorValue;

  // unused
  themeLight: ColorValue;

  // unused
  themeLighter: ColorValue;

  // unused
  themeLighterAlt: ColorValue;

  // ROLE: Text, should not be called black
  // bodyTextChecked, buttonTextCheckedHovered
  black: ColorValue;

  // unused
  blackTranslucent40: ColorValue;

  // ROLE: text
  // inputTextHovered, buttonTextHovered, buttonTextChecked, buttonTextPressed, menuItemTextHovered, actionLinkHovered
  neutralDark: ColorValue;

  // ROLE: text, border
  // bodyText, inputBorderHovered, inputText, buttonText, menuItemText, listText, actionLink
  neutralPrimary: ColorValue;

  // unused
  neutralPrimaryAlt: ColorValue;

  // ROLE: text, border
  // bodySubtext, focusBorder, smallInputBorder, inputPlaceholderText
  neutralSecondary: ColorValue;

  // ROLE: border
  // buttonBorder
  neutralSecondaryAlt: ColorValue;

  // ROLE: text, border
  // disabledText, disabledBodyText, variantBorderHovered, inputBorder, buttonTextDisabled
  neutralTertiary: ColorValue;

  // ROLE: text, background, border
  // disabledBodySubtext, buttonBackgroundChecked, menuDivider
  neutralTertiaryAlt: ColorValue;

  // ROLE: text
  // disabledSubtext, primaryButtonTextDisabled
  neutralQuaternary: ColorValue;

  // ROLE: background
  // listItemBackgroundCheckedHovered
  neutralQuaternaryAlt: ColorValue;

  // ROLE: background, border
  // bodyFrameDivider, bodyDivider, variantBorder, buttonBackgroundHovered, buttonBackgroundCheckedHovered
  // buttonBackgroundPressed, menuItemBackgroundPressed, listItemBackgroundChecked, listHeaderBackgroundPressed
  neutralLight: ColorValue;

  // ROLE: background, border (though really to blend with bgs)
  // disabledBackground, buttonBackground, buttonBackgroundDisabled, buttonBorderDisabled, primaryButtonBackgroundDisabled
  // menuItemBackgroundHovered, listItemBackgroundHovered, listHeaderBackgroundHovered
  neutralLighter: ColorValue;

  // ROLE: background
  // bodyStandoutBackground, defaultStateBackground
  neutralLighterAlt: ColorValue;

  // ROLE: background
  // accentButtonBackground
  accent: ColorValue;

  // ROLE: background, theme/accent text
  // bodyBackground, bodyFrameBackground, inputBackground, inputForegroundChecked, primaryButtonText, primaryButtonTextHovered
  // primaryButtonTextPressed, accentButtonText, menuBackground, listBackground
  white: ColorValue;

  // red color
  red: ColorValue;

  // ROLE: text
  // errorText (if !inverted)
  redDark: ColorValue;
}

/**
 * semantic color definitions for text colors.  These match ISemanticTextColors in fabric.
 */
export interface PaletteTextColors {
  /** The default color for text. */
  bodyText: ColorValue;
  /** Checked text color, e.g. selected menu item text. */
  bodyTextChecked: ColorValue;
  /** De-emphasized text; e.g. metadata, captions, placeholder text. */
  subText: ColorValue;
  /** Neutral colored links and links for action buttons. */
  actionLink: ColorValue;
  /** Hover state for neutral colored links and links for action buttons. */
  actionLinkHovered: ColorValue;

  /** The color of a link. */
  link: ColorValue;
  /** The color of a hovered link. Also used when the link is active. */
  linkHovered: ColorValue;
  /** The color of a pressed link. */
  linkPressed: ColorValue;
  /** The default color for disabled text on top of disabledBackground; e.g. text in a disabled text field, disabled button text. */
  disabledText: ColorValue;
  /** The default color for disabled text on the default background (bodyBackground). */
  disabledBodyText: ColorValue;
  /** Disabled de-emphasized text, for use on disabledBackground. */
  disabledSubtext: ColorValue;
  /** Disabled de-emphasized text, for use on the default background (bodyBackground). */
  disabledBodySubtext: ColorValue;

  //// Invariants - slots that rarely change color theme-to-theme because the color has meaning

  /** The default color of error text, used on bodyBackground. */
  errorText: ColorValue;
  /** The color of text on errorBackground, warningBackground, blockingBackground, or successBackground. */
  warningText: ColorValue;
  /** The color of input text. */
  inputText: ColorValue;
  /** The color of input text on hover. */
  inputTextHovered: ColorValue;
  /** The color of placeholder text. */
  inputPlaceholderText: ColorValue;

  //// Buttons

  /** Color of text in a standard button */
  buttonText: ColorValue;
  /** Color of text in a hovered standard button */
  buttonTextHovered: ColorValue;
  /** Color of text in a checked standard button */
  buttonTextChecked: ColorValue;
  /** Color of text in a checked and hovered standard button */
  buttonTextCheckedHovered: ColorValue;
  /** Color of text in a pressed standard button; i.e. currently being clicked by mouse */
  buttonTextPressed: ColorValue;
  /** Color of text in a disabled standard button */
  buttonTextDisabled: ColorValue;

  /** Color of text in a primary button */
  primaryButtonText: ColorValue;
  /** Color of text in a hovered primary button */
  primaryButtonTextHovered: ColorValue;
  /** Color of text in a pressed primary button; i.e. currently being clicked by mouse */
  primaryButtonTextPressed: ColorValue;
  /** Color of text in a disabled primary button */
  primaryButtonTextDisabled: ColorValue;

  /** Color of text for accent button (kicker) */
  accentButtonText: ColorValue;

  //// Lists

  /** The default text color for list item titles and text in column fields. */
  listText: ColorValue;
}

/**
 * Background and divider colors, separated by semantic role.  These names and roles match
 * those in ISemanticColors in fabric
 */
export interface PaletteBackgroundColors {
  //// Base slots

  /** The default color for backgrounds. */
  background: ColorValue;
  /** A standout background a shade darker then background (or lighter in dark themes) */
  bodyStandoutBackground: ColorValue;
  /** The color for chrome adjacent to an area with bodyBackground.  Should either be distinct, or match bodyBackground */
  bodyFrameBackground: ColorValue;
  /** Border between bodyBackground and bodyFrameBackground, distinct if they match, matching bodyFrameBackground if not */
  bodyFrameDivider: ColorValue;
  /** Divider lines; e.g. lines that separate sections in a menu, an <HR> element. */
  bodyDivider: ColorValue;
  /** The default color for backgrounds of disabled controls; e.g. disabled text field. */
  disabledBackground: ColorValue;
  /** The color of the outline around focused controls that don't already have a border; e.g. menu items */
  focusBorder: ColorValue;
  /** The color of the border that provides contrast between an element, such as a card, and an emphasized background. */
  variantBorder: ColorValue;
  /** Hover color of border that provides contrast between an element, such as a card, and an emphasized background. */
  variantBorderHovered: ColorValue;
  /** Background color for default/empty state elements; default icons, placeholder graphics, empty seats, etc. */
  defaultStateBackground: ColorValue;

  //// Invariants - slots that rarely change color theme-to-theme because the color has meaning

  /** The background for errors, if necessary, or highlighting the section of the page where the error is present. */
  errorBackground: ColorValue;
  /** Background for blocking issues, which is more severe than a warning, but not as bad as an error. */
  blockingBackground: ColorValue;
  /** Background for warning messages. */
  warningBackground: ColorValue;
  /** Foreground color for warning highlights */
  warningHighlight: ColorValue;
  /** Background for success */
  successBackground: ColorValue;

  //// Input controls slots (text fields, checkboxes, radios...)

  /** The border of a large input control in its resting, state; e.g. the box of dropdown. */
  inputBorder: ColorValue;
  /** The border of a small input control in its resting unchecked state; e.g. the box of an unchecked checkbox. */
  smallInputBorder: ColorValue;
  /** The border color of a large hovered input control, such as textbox. */
  inputBorderHovered: ColorValue;
  /** The background color of an input, e.g. textbox background. */
  inputBackground: ColorValue;
  /** The background of a checked control; e.g. checked radio button's dot, checked toggle's background. */
  inputBackgroundChecked: ColorValue;
  /** The background of a checked and hovered control; e.g. checked checkbox's background color on hover. */
  inputBackgroundCheckedHovered: ColorValue;
  /** The foreground of a checked control; e.g. checked checkbox's checkmark color, checked toggle's thumb color */
  inputForegroundChecked: ColorValue;
  /** The alternate focus border color for elements that already have a border; e.g. text field borders on focus. */
  inputFocusBorderAlt: ColorValue;

  //// Buttons

  /** Background of a standard button */
  buttonBackground: ColorValue;
  /** Background of a checked standard button; e.g. bold/italicize/underline text button in toolbar */
  buttonBackgroundChecked: ColorValue;
  /** Background of a hovered standard button */
  buttonBackgroundHovered: ColorValue;
  /** Background of a checked and hovered standard button; e.g. bold/italicize/underline text button in toolbar */
  buttonBackgroundCheckedHovered: ColorValue;
  /** Background of a disabled standard button */
  buttonBackgroundDisabled: ColorValue;
  /** Background of a pressed standard button; i.e. currently being clicked by mouse */
  buttonBackgroundPressed: ColorValue;
  /** Border of a standard button */
  buttonBorder: ColorValue;
  /** Border of a standard button in focused state */
  buttonBorderFocused: ColorValue;
  /** Border of a disabled standard button */
  buttonBorderDisabled: ColorValue;
  /** Background of a primary button */
  primaryButtonBackground: ColorValue;
  /** Background of a hovered primary button */
  primaryButtonBackgroundHovered: ColorValue;
  /** Background of a pressed primary button; i.e. currently being clicked by mouse */
  primaryButtonBackgroundPressed: ColorValue;
  /** Background of a disabled primary button */
  primaryButtonBackgroundDisabled: ColorValue;
  /** Border of a primary button */
  primaryButtonBorder: ColorValue;
  /** Border of a primary button in focused state*/
  primaryButtonBorderFocused: ColorValue;
  /** Background of an accent button (kicker) */
  accentButtonBackground: ColorValue;

  //// Menus, popups, etc

  /** The background of a menu. */
  menuBackground: ColorValue;
  /** The divider between menu items. */
  menuDivider: ColorValue;
  /** The default colors of icons in menus. */
  menuIcon: ColorValue;
  /** The headers in menus that denote title of a section. */
  menuHeader: ColorValue;
  /** The background of a hovered menu item. */
  menuItemBackgroundHovered: ColorValue;
  /** The background of a pressed menu item. */
  menuItemBackgroundPressed: ColorValue;
  /** The text color of a menu item. */
  menuItemText: ColorValue;
  /** The text color of a hovered menu item. */
  menuItemTextHovered: ColorValue;

  //// Lists

  /** The background color for the entire list. */
  listBackground: ColorValue;
  /** The default text color for list item titles and text in column fields. */
  listText: ColorValue;
  /** The background color of a hovered list item. */
  listItemBackgroundHovered: ColorValue;
  /** The background color of a checked list item. */
  listItemBackgroundChecked: ColorValue;
  /** The background color of a checked and hovered list item. */
  listItemBackgroundCheckedHovered: ColorValue;
  /** The background color for a hovered list header. */
  listHeaderBackgroundHovered: ColorValue;
  /** The background color for a pressed list header. */
  listHeaderBackgroundPressed: ColorValue;
}

export interface ControlColorTokens {
  buttonBackground: ColorValue;
  buttonBorder: ColorValue;
  buttonContent: ColorValue;
  buttonIcon: ColorValue;

  buttonHoveredBackground: ColorValue;
  buttonHoveredBorder: ColorValue;
  buttonHoveredContent: ColorValue;
  buttonHoveredIcon: ColorValue;

  buttonFocusedBackground: ColorValue;
  buttonFocusedBorder: ColorValue;
  buttonFocusedContent: ColorValue;
  buttonFocusedIcon: ColorValue;

  buttonPressedBackground: ColorValue;
  buttonPressedBorder: ColorValue;
  buttonPressedContent: ColorValue;
  buttonPressedIcon: ColorValue;

  buttonDisabledBackground: ColorValue;
  buttonDisabledBorder: ColorValue;
  buttonDisabledContent: ColorValue;
  buttonDisabledIcon: ColorValue;

  ghostBackground: ColorValue;
  ghostBorder: ColorValue;
  ghostContent: ColorValue;
  ghostIcon: ColorValue;

  ghostHoveredBackground: ColorValue;
  ghostHoveredBorder: ColorValue;
  ghostHoveredContent: ColorValue;
  ghostHoveredIcon: ColorValue;

  ghostFocusedBackground: ColorValue;
  ghostFocusedBorder: ColorValue;
  ghostFocusedContent: ColorValue;
  ghostFocusedIcon: ColorValue;

  ghostPressedBackground: ColorValue;
  ghostPressedBorder: ColorValue;
  ghostPressedContent: ColorValue;
  ghostPressedIcon: ColorValue;

  ghostDisabledBackground: ColorValue;
  ghostDisabledBorder: ColorValue;
  ghostDisabledContent: ColorValue;
  ghostDisabledIcon: ColorValue;

  brandBackground: ColorValue;
  brandBorder: ColorValue;
  brandContent: ColorValue;
  brandIcon: ColorValue;

  brandHoveredBackground: ColorValue;
  brandHoveredBorder: ColorValue;
  brandHoveredContent: ColorValue;
  brandHoveredIcon: ColorValue;

  brandFocusedBackground: ColorValue;
  brandFocusedBorder: ColorValue;
  brandFocusedContent: ColorValue;
  brandFocusedIcon: ColorValue;

  brandPressedBackground: ColorValue;
  brandPressedBorder: ColorValue;
  brandPressedContent: ColorValue;
  brandPressedIcon: ColorValue;

  brandDisabledBackground: ColorValue;
  brandDisabledBorder: ColorValue;
  brandDisabledContent: ColorValue;
  brandDisabledIcon: ColorValue;

  buttonCheckedBackground: ColorValue;
  buttonCheckedContent: ColorValue;
  buttonCheckedHoveredBackground: ColorValue;
  buttonCheckedHoveredContent: ColorValue;

  brandCheckedBackground: ColorValue;
  brandCheckedContent: ColorValue;
  brandCheckedHoveredBackground: ColorValue;
  brandCheckedHoveredContent: ColorValue;

  ghostCheckedBackground: ColorValue;
  ghostCheckedContent: ColorValue;
  ghostCheckedHoveredBackground: ColorValue;
  ghostCheckedHoveredContent: ColorValue;
  ghostCheckedHoveredBorder: ColorValue;

  ghostSecondaryContent: ColorValue;
  ghostFocusedSecondaryContent: ColorValue;
  ghostHoveredSecondaryContent: ColorValue;
  ghostPressedSecondaryContent: ColorValue;

  brandSecondaryContent: ColorValue;
  brandFocusedSecondaryContent: ColorValue;
  brandHoveredSecondaryContent: ColorValue;
  brandPressedSecondaryContent: ColorValue;

  buttonDisabledSecondaryContent: ColorValue;
  buttonHoveredSecondaryContent: ColorValue;
  buttonPressedSecondaryContent: ColorValue;

  checkboxBackground: ColorValue;
  checkboxBackgroundDisabled: ColorValue;
  checkmarkColor: ColorValue;

  personaActivityRing: ColorValue;
  personaActivityGlow: ColorValue;
}

/**
 * A collection of named palette colors.
 *
 * Palette names describe the role of a color within the application.
 */
export type Palette = PaletteTextColors & PaletteBackgroundColors & Partial<ControlColorTokens>;

/**
 * A partially specified color palette.
 */
export type PartialPalette = Partial<Palette>;

/**
 * A color, used when defining a visual element in a theme.
 */
export type Color = keyof Palette | ColorValue;
