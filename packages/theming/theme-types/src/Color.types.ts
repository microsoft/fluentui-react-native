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
  defaultBackground: ColorValue;
  defaultBorder: ColorValue;
  defaultContent: ColorValue;
  defaultIcon: ColorValue;

  defaultHoveredBackground: ColorValue;
  defaultHoveredBorder: ColorValue;
  defaultHoveredContent: ColorValue;
  defaultHoveredIcon: ColorValue;

  defaultFocusedBackground: ColorValue;
  defaultFocusedBorder: ColorValue;
  defaultFocusedContent: ColorValue;
  defaultFocusedIcon: ColorValue;

  defaultPressedBackground: ColorValue;
  defaultPressedBorder: ColorValue;
  defaultPressedContent: ColorValue;
  defaultPressedIcon: ColorValue;

  defaultDisabledBackground: ColorValue;
  defaultDisabledBorder: ColorValue;
  defaultDisabledContent: ColorValue;
  defaultDisabledIcon: ColorValue;

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

  brandedBackground: ColorValue;
  brandedBorder: ColorValue;
  brandedContent: ColorValue;
  brandedIcon: ColorValue;

  brandedHoveredBackground: ColorValue;
  brandedHoveredBorder: ColorValue;
  brandedHoveredContent: ColorValue;
  brandedHoveredIcon: ColorValue;

  brandedFocusedBackground: ColorValue;
  brandedFocusedBorder: ColorValue;
  brandedFocusedContent: ColorValue;
  brandedFocusedIcon: ColorValue;

  brandedPressedBackground: ColorValue;
  brandedPressedBorder: ColorValue;
  brandedPressedContent: ColorValue;
  brandedPressedIcon: ColorValue;

  brandedDisabledBackground: ColorValue;
  brandedDisabledBorder: ColorValue;
  brandedDisabledContent: ColorValue;
  brandedDisabledIcon: ColorValue;

  defaultCheckedBackground: ColorValue;
  defaultCheckedContent: ColorValue;
  defaultCheckedHoveredBackground: ColorValue;
  defaultCheckedHoveredContent: ColorValue;

  brandedCheckedBackground: ColorValue;
  brandedCheckedContent: ColorValue;
  brandedCheckedHoveredBackground: ColorValue;
  brandedCheckedHoveredContent: ColorValue;

  ghostCheckedBackground: ColorValue;
  ghostCheckedContent: ColorValue;
  ghostCheckedHoveredBackground: ColorValue;
  ghostCheckedHoveredContent: ColorValue;
  ghostCheckedHoveredBorder: ColorValue;

  ghostSecondaryContent: ColorValue;
  ghostFocusedSecondaryContent: ColorValue;
  ghostHoveredSecondaryContent: ColorValue;
  ghostPressedSecondaryContent: ColorValue;

  brandedSecondaryContent: ColorValue;
  brandedFocusedSecondaryContent: ColorValue;
  brandedHoveredSecondaryContent: ColorValue;
  brandedPressedSecondaryContent: ColorValue;

  defaultDisabledSecondaryContent: ColorValue;
  defaultHoveredSecondaryContent: ColorValue;
  defaultPressedSecondaryContent: ColorValue;

  checkboxBackground: ColorValue;
  checkboxBackgroundDisabled: ColorValue;
  checkmarkColor: ColorValue;
  checkboxBorderColor: ColorValue;

  personaActivityRing: ColorValue;
  personaActivityGlow: ColorValue;
}

export interface AliasColorTokens {
  /// Neutral

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralForeground1: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground1Hover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground1Pressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground1Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralForeground2: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground2Hover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground2Pressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground2Selected: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground2BrandHover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground2BrandPressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground2BrandSelected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralForeground3: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground3Hover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground3Pressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground3Selected: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground3BrandHover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground3BrandPressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground3BrandSelected: ColorValue;

  /** Defined on platforms: android, iOS */
  neutralForegroundDisabled1?: ColorValue;

  /** Defined on platforms: android, iOS */
  neutralForegroundDisabled2?: ColorValue;

  /** Defined on platforms: android, iOS */
  neutralForegroundOnColor?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForeground4?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundDisabled?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /** Defined on platforms: android, macOS, win32, windows */
  neutralForegroundInverted: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundOnBrand?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundOnBrandHover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundOnBrandPressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundOnBrandSelected?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundInvertedLink?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundInvertedLinkHover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundInvertedLinkPressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralForegroundInvertedLinkSelected?: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground1: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralBackground1Hover: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground1Pressed: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground1Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground2: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralBackground2Hover: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground2Pressed: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground2Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground3: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralBackground3Hover: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground3Pressed: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground3Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground4: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralBackground4Hover: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground4Pressed: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground4Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground5: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralBackground5Hover: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground5Pressed: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground5Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackground6: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackgroundInverted: ColorValue;

  /** Defined on platforms: android, iOS */
  neutralBackgroundLightStatic?: ColorValue;

  /** Defined on platforms: android, iOS */
  neutralBackgroundLightStaticDisabled?: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralBackgroundDisabled: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralStencil1: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralStencil2: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralStrokeAccessible: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStrokeAccessibleHover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStrokeAccessiblePressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStrokeAccessibleSelected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralStroke1: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStroke1Hover: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStroke1Pressed: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStroke1Selected: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralStroke2: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  neutralStroke3?: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  neutralStrokeDisabled: ColorValue;

  /// Brand

  /** Defined on platforms: macOS, win32, windows */
  brandForegroundLink?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandForegroundLinkHover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandForegroundLinkPressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandForegroundLinkSelected?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandForeground1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandForeground1Hover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandForeground1Pressed?: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  brandForeground1: ColorValue;

  // TODO #2445: rename to brandForegroundDisabled1
  /** Defined on platforms: android, iOS */
  brandForeground1Disabled?: ColorValue;

  /** Defined on platforms: android, iOS, macOS */
  brandForeground1Pressed: ColorValue;

  /** Defined on platforms: android, iOS, macOS */
  brandForeground1Selected?: ColorValue;

  /** Defined on platforms: android, iOS */
  brandForegroundTint?: ColorValue;

  /** Defined on platforms: android, iOS */
  brandForegroundDisabled1?: ColorValue;

  /** Defined on platforms: android, iOS */
  brandForegroundDisabled2?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandForeground2?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandBackground: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandBackgroundHover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandBackgroundPressed: ColorValue;

  /** Defined on platforms: macOS */
  brandBackgroundDisabled?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandBackgroundSelected: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandBackground1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandBackground1Hover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandBackground1Pressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows  */
  brandBackgroundStatic?: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  brandBackground2: ColorValue;

  /** Defined on platforms: android, iOS */
  brandBackground2Pressed?: ColorValue;

  /** Defined on platforms: android, iOS */
  brandBackground2Selected?: ColorValue;

  /** Defined on platforms: android, iOS */
  brandBackground3?: ColorValue;

  /** Defined on platforms: android, iOS */
  brandBackgroundTint?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /** Defined on platforms: android */
  brandBackgroundInverted?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /** Defined on platforms: android */
  brandBackgroundInvertedDisabled?: ColorValue;

  /** Defined on platforms: android, iOS, macOS, win32, windows */
  brandStroke1: ColorValue;

  /** Defined on platforms: android, iOS, macOS */
  brandStroke1Pressed?: ColorValue;

  /** Defined on platforms: android, iOS, macOS */
  brandStroke1Selected?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  brandStroke2?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandStroke1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandStroke1Hover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  compoundBrandStroke1Pressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  subtleBackground?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  subtleBackgroundHover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  subtleBackgroundPressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  subtleBackgroundSelected?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  transparentBackground?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  transparentBackgroundHover?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  transparentBackgroundPressed?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  transparentBackgroundSelected?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  strokeFocus1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows*/
  strokeFocus2?: ColorValue;

  /** Defined on platforms: windows */
  transparentStroke?: ColorValue;

  /** Defined on platforms:  */
  transparentStrokeInteractive?: ColorValue;

  /** Defined on platforms:  */
  transparentStrokeDisabled?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redBackground1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redBackground2?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redBackground3?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redForeground1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redForeground2?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redForeground3?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redBorderActive?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redBorder1?: ColorValue;

  /** Defined on platforms: macOS, win32, windows */
  redBorder2?: ColorValue;
}

/**
 * A collection of named palette colors.
 *
 * Palette names describe the role of a color within the application.
 */
export type Palette = PaletteTextColors & PaletteBackgroundColors & Partial<ControlColorTokens> & Partial<AliasColorTokens>;

/**
 * A partially specified color palette.
 */
export type PartialPalette = Partial<Palette>;

/**
 * A color, used when defining a visual element in a theme.
 */
export type Color = keyof Palette | ColorValue;
