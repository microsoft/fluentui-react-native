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

import type { ColorValue } from 'react-native';

export type ThemeColorDefinition = Palette & {
  background: ColorValue;
  bodyText: ColorValue;
  subText: ColorValue;
  disabledText: ColorValue;
  [customColor: string]: ColorValue;
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

  /* Deprecated */
  brandedBackground: ColorValue;
  /* Deprecated */
  brandedBorder: ColorValue;
  /* Deprecated */
  brandedContent: ColorValue;
  /* Deprecated */
  brandedIcon: ColorValue;

  /* Deprecated */
  brandedHoveredBackground: ColorValue;
  /* Deprecated */
  brandedHoveredBorder: ColorValue;
  /* Deprecated */
  brandedHoveredContent: ColorValue;
  /* Deprecated */
  brandedHoveredIcon: ColorValue;

  /* Deprecated */
  brandedFocusedBackground: ColorValue;
  /* Deprecated */
  brandedFocusedBorder: ColorValue;
  /* Deprecated */
  brandedFocusedContent: ColorValue;
  /* Deprecated */
  brandedFocusedIcon: ColorValue;

  /* Deprecated */
  brandedPressedBackground: ColorValue;
  /* Deprecated */
  brandedPressedBorder: ColorValue;
  /* Deprecated */
  brandedPressedContent: ColorValue;
  /* Deprecated */
  brandedPressedIcon: ColorValue;

  /* Deprecated */
  brandedDisabledBackground: ColorValue;
  /* Deprecated */
  brandedDisabledBorder: ColorValue;
  /* Deprecated */
  brandedDisabledContent: ColorValue;
  /* Deprecated */
  brandedDisabledIcon: ColorValue;

  /* Deprecated */
  brandedCheckedBackground: ColorValue;
  /* Deprecated */
  brandedCheckedContent: ColorValue;
  /* Deprecated */
  brandedCheckedHoveredBackground: ColorValue;
  /* Deprecated */
  brandedCheckedHoveredContent: ColorValue;

  /* Deprecated */
  brandedSecondaryContent: ColorValue;
  /* Deprecated */
  brandedFocusedSecondaryContent: ColorValue;
  /* Deprecated */
  brandedHoveredSecondaryContent: ColorValue;
  /* Deprecated */
  brandedPressedSecondaryContent: ColorValue;

  defaultCheckedBackground: ColorValue;
  defaultCheckedContent: ColorValue;
  defaultCheckedHoveredBackground: ColorValue;
  defaultCheckedHoveredContent: ColorValue;

  ghostCheckedBackground: ColorValue;
  ghostCheckedContent: ColorValue;
  ghostCheckedHoveredBackground: ColorValue;
  ghostCheckedHoveredContent: ColorValue;
  ghostCheckedHoveredBorder: ColorValue;

  ghostSecondaryContent: ColorValue;
  ghostFocusedSecondaryContent: ColorValue;
  ghostHoveredSecondaryContent: ColorValue;
  ghostPressedSecondaryContent: ColorValue;

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
  /// Foreground colors

  /** @platform android, iOS, macOS, win32, windows */
  neutralForeground1?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground1Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground1Pressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground1Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralForeground2?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2Pressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2Selected?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2BrandHover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2BrandPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2BrandSelected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralForeground3?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground3Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground3Pressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground3Selected?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground3BrandHover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground3BrandPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground3BrandSelected?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground4?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundDisabled?: ColorValue;

  /** @platform android, iOS */
  neutralForegroundDisabled1?: ColorValue;

  /** @platform android, iOS */
  neutralForegroundDisabled2?: ColorValue;

  /** @platform android, iOS */
  neutralForegroundOnColor?: ColorValue;

  // TODO #2440: Add to android
  /** @platform iOS */
  neutralForegroundDarkStatic?: ColorValue;

  // TODO #2440: Add to android
  /** @platform iOS */
  neutralForegroundLightStatic?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundOnBrand?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundOnBrandHover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundOnBrandPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundOnBrandSelected?: ColorValue;

  // TODO: remove definition from Android
  /** @platform android, macOS, win32, windows */
  neutralForegroundInverted?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundInvertedLink?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundInvertedLinkHover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundInvertedLinkPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundInvertedLinkSelected?: ColorValue;

  /** @platform macOS, win32, windows */
  brandForegroundLink?: ColorValue;

  /** @platform macOS, win32, windows */
  brandForegroundLinkHover?: ColorValue;

  /** @platform macOS, win32, windows */
  brandForegroundLinkPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  brandForegroundLinkSelected?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandForeground1?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandForeground1Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandForeground1Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  brandForeground1?: ColorValue;

  /** @platform android, iOS, macOS */
  brandForeground1Pressed?: ColorValue;

  /** @platform android, iOS, macOS */
  brandForeground1Selected?: ColorValue;

  /** @platform macOS, win32, windows */
  brandForeground2?: ColorValue;

  /** @platform android, iOS */
  brandForegroundTint?: ColorValue;

  // TODO: rename to brandForegroundDisabled1
  /** @platform android, iOS */
  brandForeground1Disabled?: ColorValue;

  /** @platform android, iOS */
  brandForegroundDisabled1?: ColorValue;

  /** @platform android, iOS */
  brandForegroundDisabled2?: ColorValue;

  // Background colors

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground1?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground1Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground1Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground1Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground2Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground2Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground2Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground3?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground3Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground3Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground3Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground4?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground4Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground4Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground4Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground5?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground5Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground5Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground5Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground6?: ColorValue;

  /** @platform iOS, android */
  neutralBackgroundCanvas?: ColorValue;

  /** @platform iOS, android */
  neutralBackgroundDarkStatic?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackgroundInverted?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackgroundDisabled?: ColorValue;

  /** @platform android, iOS */
  neutralBackgroundLightStatic?: ColorValue;

  /** @platform android, iOS */
  neutralBackgroundLightStaticDisabled?: ColorValue;

  /** @platform macOS, win32, windows */
  subtleBackground?: ColorValue;

  /** @platform macOS, win32, windows */
  subtleBackgroundHover?: ColorValue;

  /** @platform macOS, win32, windows */
  subtleBackgroundPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  subtleBackgroundSelected?: ColorValue;

  /** @platform macOS, win32, windows */
  transparentBackground?: ColorValue;

  /** @platform macOS, win32, windows */
  transparentBackgroundHover?: ColorValue;

  /** @platform macOS, win32, windows */
  transparentBackgroundPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  transparentBackgroundSelected?: ColorValue;

  /** @platform macOS, win32, windows */
  brandBackground?: ColorValue;

  /** @platform macOS, win32, windows */
  brandBackgroundHover?: ColorValue;

  /** @platform macOS, win32, windows */
  brandBackgroundPressed?: ColorValue;

  /** @platform macOS */
  brandBackgroundDisabled?: ColorValue;

  /** @platform macOS, win32, windows */
  brandBackgroundSelected?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandBackground1?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandBackground1Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandBackground1Pressed?: ColorValue;

  /** @platform macOS, win32, windows  */
  brandBackgroundStatic?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  brandBackground2?: ColorValue;

  /** @platform android, iOS */
  brandBackground2Pressed?: ColorValue;

  /** @platform android, iOS */
  brandBackground2Selected?: ColorValue;

  /** @platform android, iOS */
  brandBackground3?: ColorValue;

  /** @platform android, iOS */
  brandBackgroundTint?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /** @platform android */
  brandBackgroundInverted?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /** @platform android */
  brandBackgroundInvertedDisabled?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralStencil1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralStencil2?: ColorValue;

  // Stroke

  /** @platform android, iOS, macOS, win32, windows */
  neutralStrokeAccessible?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStrokeAccessibleHover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStrokeAccessiblePressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStrokeAccessibleSelected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralStroke1?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStroke1Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStroke1Pressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStroke1Selected?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralStroke2?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStroke3?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralStrokeDisabled?: ColorValue;

  /** @platform iOS, android */
  neutralStrokeFocus1?: ColorValue;

  /** @platform iOS, android */
  neutralStrokeFocus2?: ColorValue;

  /** @platform macOS, win32, windows */
  strokeFocus1?: ColorValue;

  /** @platform macOS, win32, windows*/
  strokeFocus2?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  brandStroke1?: ColorValue;

  /** @platform android, iOS, macOS */
  brandStroke1Pressed?: ColorValue;

  /** @platform android, iOS, macOS */
  brandStroke1Selected?: ColorValue;

  /** @platform macOS, win32, windows */
  brandStroke2?: ColorValue;

  /** @platform android, iOS */
  brandStrokeTint?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandStroke1?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandStroke1Hover?: ColorValue;

  /** @platform macOS, win32, windows */
  compoundBrandStroke1Pressed?: ColorValue;

  /** @platform windows */
  transparentStroke?: ColorValue;

  /** @platform  */
  transparentStrokeInteractive?: ColorValue;

  /** @platform  */
  transparentStrokeDisabled?: ColorValue;

  /// Red

  /** @deprecated */
  redBackground1?: ColorValue;

  /** @deprecated */
  redBackground2?: ColorValue;

  /** @deprecated */
  redBackground3?: ColorValue;

  /** @deprecated */
  redForeground1?: ColorValue;

  /** @deprecated */
  redForeground2?: ColorValue;

  /** @deprecated */
  redForeground3?: ColorValue;

  /** @deprecated */
  redBorderActive?: ColorValue;

  /** @deprecated */
  redBorder1?: ColorValue;

  /** @deprecated */
  redBorder2?: ColorValue;

  /// Error, status, and presence tokens

  /** @platform android, iOS, macOS, win32, windows  */
  dangerBackground1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  dangerBackground2?: ColorValue;

  /** @platform macOS, win32, windows  */
  dangerBackground3?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  dangerForeground1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  dangerForeground2?: ColorValue;

  /** @platform macOS, win32, windows */
  dangerForeground3?: ColorValue;

  /** @platform macOS, win32, windows */
  dangerForegroundInverted?: ColorValue;

  /** @platform macOS, win32, windows */
  dangerBorderActive?: ColorValue;

  /** @platform macOS, win32, windows */
  dangerBorder1?: ColorValue;

  /** @platform macOS, win32, windows */
  dangerBorder2?: ColorValue;

  /** @platform android, iOS  */
  dangerStroke1?: ColorValue;

  /** @platform iOS, macOS, android, win32, windows  */
  successBackground1?: ColorValue;

  /** @platform iOS, android, macOS, win32, windows  */
  successBackground2?: ColorValue;

  /** @platform macOS, win32, windows  */
  successBackground3?: ColorValue;

  /** @platform iOS, android, macOS, win32, windows  */
  successForeground1?: ColorValue;

  /** @platform iOS, android, macOS, win32, windows  */
  successForeground2?: ColorValue;

  /** @platform macOS, win32, windows */
  successForeground3?: ColorValue;

  /** @platform macOS, win32, windows */
  successForegroundInverted?: ColorValue;

  /** @platform macOS, win32, windows */
  successBorderActive?: ColorValue;

  /** @platform macOS, win32, windows */
  successBorder1?: ColorValue;

  /** @platform macOS, win32, windows */
  successBorder2?: ColorValue;

  /** @platform android, iOS  */
  successStroke1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  warningBackground1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  warningBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  warningBackground3?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  warningForeground1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  warningForeground2?: ColorValue;

  /** @platform macOS, win32, windows */
  warningForeground3?: ColorValue;

  /** @platform macOS, win32, windows */
  warningForegroundInverted?: ColorValue;

  /** @platform macOS, win32, windows */
  warningBorderActive?: ColorValue;

  /** @platform macOS, win32, windows */
  warningBorder1?: ColorValue;

  /** @platform macOS, win32, windows */
  warningBorder2?: ColorValue;

  /** @platform android, iOS  */
  warningStroke1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  severeBackground1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  severeBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  severeBackground3?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  severeForeground1?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows  */
  severeForeground2?: ColorValue;

  /** @platform macOS, win32, windows */
  severeForeground3?: ColorValue;

  /** @platform macOS, win32, windows */
  severeBorderActive?: ColorValue;

  /** @platform macOS, win32, windows */
  severeBorder1?: ColorValue;

  /** @platform macOS, win32, windows */
  severeBorder2?: ColorValue;

  /** @platform android, iOS  */
  severeStroke1?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeBackground1?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeBackground3?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeForeground1?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeForeground2?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeForeground3?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeBorderActive?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeBorder1?: ColorValue;

  /** @platform macOS, win32, windows */
  outofofficeBorder2?: ColorValue;

  /** @platform iOS, android  */
  presenceAway?: ColorValue;

  /** @platform iOS, android  */
  presenceDnd?: ColorValue;

  /** @platform iOS, android  */
  presenceAvailable?: ColorValue;

  /** @platform iOS, android  */
  presenceOof?: ColorValue;
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
