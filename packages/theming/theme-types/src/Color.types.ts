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

/**
 * @deprecated These tokens are not part of the Fluent design system.
 */
export interface FabricWebPalette {
  /**
   * ROLE: Themed text
   * linkHovered
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeDarker: ColorValue;

  /**
   * ROLE: Themed background
   * primaryButtonBackgroundPressed
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeDark: ColorValue;

  /**
   * ROLE: Themed background
   * primaryButtonBackgroundHovered
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeDarkAlt: ColorValue;

  /**
   * ROLE: Themed background, border, text
   * inputFocusBorderAlt, primaryButtonBackground, menuIcon, link
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themePrimary: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeSecondary: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeTertiary: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeLight: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeLighter: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  themeLighterAlt: ColorValue;

  /**
   * ROLE: Text, should not be called black
   * bodyTextChecked
   * @deprecated These tokens are not part of the Fluent design system.
   */
  black: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  blackTranslucent40: ColorValue;

  /**
   * ROLE: text
   * buttonTextHovered, buttonTextChecked, buttonTextPressed, menuItemTextHovered
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralDark: ColorValue;

  /**
   * ROLE: text, border
   * bodyText, inputText, buttonText, menuItemText, actionLink
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralPrimary: ColorValue;

  /**
   * unused
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralPrimaryAlt: ColorValue;

  /**
   * ROLE: text, border
   * bodySubtext, focusBorder, inputPlaceholderText
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralSecondary: ColorValue;

  /**
   * ROLE: border
   * buttonBorder
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralSecondaryAlt: ColorValue;

  /**
   * ROLE: text, border
   * disabledText, disabledBodyText, inputBorder, buttonTextDisabled
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralTertiary: ColorValue;

  /**
   * ROLE: text, background, border
   * buttonBackgroundChecked, menuDivider
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralTertiaryAlt: ColorValue;

  /**
   * ROLE: text
   * primaryButtonTextDisabled
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralQuaternary: ColorValue;

  /**
   * ROLE: background
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralQuaternaryAlt: ColorValue;

  /**
   * ROLE: background, border
   * bodyFrameDivider, bodyDivider, variantBorder, buttonBackgroundHovered
   * buttonBackgroundPressed, menuItemBackgroundPressed, listHeaderBackgroundPressed
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralLight: ColorValue;

  /**
   * ROLE: background, border (though really to blend with bgs)
   * disabledBackground, buttonBackground, buttonBackgroundDisabled, buttonBorderDisabled, primaryButtonBackgroundDisabled
   *  menuItemBackgroundHovered, listHeaderBackgroundHovered
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralLighter: ColorValue;

  /**
   * ROLE: background
   * bodyStandoutBackground
   * @deprecated These tokens are not part of the Fluent design system.
   */
  neutralLighterAlt: ColorValue;

  /**
   * ROLE: background
   * accentButtonBackground
   * @deprecated These tokens are not part of the Fluent design system.
   */
  accent: ColorValue;

  /**
   * ROLE: background, theme/accent text
   * bodyBackground, bodyFrameBackground, inputBackground, primaryButtonText, primaryButtonTextHovered
   * primaryButtonTextPressed, menuBackground
   * @deprecated These tokens are not part of the Fluent design system.
   */
  white: ColorValue;

  /**
   * red color
   * @deprecated These tokens are not part of the Fluent design system.
   */
  red: ColorValue;

  /**
   * ROLE: Text
   *  errorText (if !inverted)
   * @deprecated These tokens are not part of the Fluent design system.
   */
  redDark: ColorValue;
}

/**
 * semantic color definitions for text colors.  These match ISemanticTextColors in fabric.
 * @deprecated These tokens are not part of the Fluent design system.
 */
export interface PaletteTextColors {
  /** The default color for text.
   *  @deprecated These tokens are not part of the Fluent design system.
   */
  bodyText: ColorValue;
  /** Checked text color, e.g. selected menu item text.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  bodyTextChecked: ColorValue;
  /** De-emphasized text; e.g. metadata, captions, placeholder text.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  subText: ColorValue;
  /** Neutral colored links and links for action buttons.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  actionLink: ColorValue;

  /** The color of a link.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  link: ColorValue;
  /** The color of a hovered link. Also used when the link is active.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  linkHovered: ColorValue;
  /** The color of a pressed link.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  linkPressed: ColorValue;
  /** The default color for disabled text on top of disabledBackground; e.g. text in a disabled text field, disabled button text.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  disabledText: ColorValue;
  /** The default color for disabled text on the default background (bodyBackground).
   * @deprecated These tokens are not part of the Fluent design system.
   */
  disabledBodyText: ColorValue;

  //// Invariants - slots that rarely change color theme-to-theme because the color has meaning

  /** The default color of error text, used on bodyBackground.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  errorText: ColorValue;
  /** The color of input text.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  inputText: ColorValue;
  /** The color of placeholder text.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  inputPlaceholderText: ColorValue;

  //// Buttons

  /** Color of text in a standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonText: ColorValue;
  /** Color of text in a hovered standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonTextHovered: ColorValue;
  /** Color of text in a checked standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonTextChecked: ColorValue;
  /** Color of text in a pressed standard button; i.e. currently being clicked by mouse
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonTextPressed: ColorValue;
  /** Color of text in a disabled standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonTextDisabled: ColorValue;

  /** Color of text in a primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonText: ColorValue;
  /** Color of text in a hovered primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonTextHovered: ColorValue;
  /** Color of text in a pressed primary button; i.e. currently being clicked by mouse
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonTextPressed: ColorValue;
  /** Color of text in a disabled primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonTextDisabled: ColorValue;
}

/**
 * Background and divider colors, separated by semantic role.  These names and roles match
 * those in ISemanticColors in fabric
 * @deprecated These tokens are not part of the Fluent design system.
 */
export interface PaletteBackgroundColors {
  //// Base slots

  /** The default color for backgrounds.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  background: ColorValue;
  /** A standout background a shade darker then background (or lighter in dark themes)
   * @deprecated These tokens are not part of the Fluent design system.
   */
  bodyStandoutBackground: ColorValue;
  /** The color for chrome adjacent to an area with bodyBackground.  Should either be distinct, or match bodyBackground
   * @deprecated These tokens are not part of the Fluent design system.
   */
  bodyFrameBackground: ColorValue;
  /** Border between bodyBackground and bodyFrameBackground, distinct if they match, matching bodyFrameBackground if not
   * @deprecated These tokens are not part of the Fluent design system.
   */
  bodyFrameDivider: ColorValue;
  /** Divider lines; e.g. lines that separate sections in a menu, an <HR> element.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  bodyDivider: ColorValue;
  /** The default color for backgrounds of disabled controls; e.g. disabled text field.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  disabledBackground: ColorValue;
  /** The color of the outline around focused controls that don't already have a border; e.g. menu items
   * @deprecated These tokens are not part of the Fluent design system.
   */
  focusBorder: ColorValue;
  /** The color of the border that provides contrast between an element, such as a card, and an emphasized background.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  variantBorder: ColorValue;

  //// Input controls slots (text fields, checkboxes, radios...)

  /** The border of a large input control in its resting, state; e.g. the box of dropdown.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  inputBorder: ColorValue;
  /** The background color of an input, e.g. textbox background.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  inputBackground: ColorValue;
  /** The alternate focus border color for elements that already have a border; e.g. text field borders on focus.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  inputFocusBorderAlt: ColorValue;

  //// Buttons

  /** Background of a standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBackground: ColorValue;
  /** Background of a checked standard button; e.g. bold/italicize/underline text button in toolbar
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBackgroundChecked: ColorValue;
  /** Background of a hovered standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBackgroundHovered: ColorValue;
  /** Background of a disabled standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBackgroundDisabled: ColorValue;
  /** Background of a pressed standard button; i.e. currently being clicked by mouse
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBackgroundPressed: ColorValue;
  /** Border of a standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBorder: ColorValue;
  /** Border of a standard button in focused state
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBorderFocused: ColorValue;
  /** Border of a disabled standard button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBorderDisabled: ColorValue;
  /** Background of a primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonBackground: ColorValue;
  /** Background of a hovered primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonBackgroundHovered: ColorValue;
  /** Background of a pressed primary button; i.e. currently being clicked by mouse
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonBackgroundPressed: ColorValue;
  /** Background of a disabled primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonBackgroundDisabled: ColorValue;
  /** Border of a primary button
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonBorder: ColorValue;
  /** Border of a primary button in focused state
   * @deprecated These tokens are not part of the Fluent design system.
   */
  primaryButtonBorderFocused: ColorValue;
  /** Background of an accent button (kicker)
   * @deprecated These tokens are not part of the Fluent design system.
   */
  accentButtonBackground: ColorValue;

  //// Menus, popups, etc

  /** The background of a menu.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuBackground: ColorValue;
  /** The divider between menu items.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuDivider: ColorValue;
  /** The default colors of icons in menus.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuIcon: ColorValue;
  /** The background of a hovered menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuItemBackgroundHovered: ColorValue;
  /** The background of a pressed menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuItemBackgroundPressed: ColorValue;
  /** The text color of a menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuItemText: ColorValue;
  /** The text color of a hovered menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuItemTextHovered: ColorValue;

  //// Lists

  /** The background color for a hovered list header.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  listHeaderBackgroundHovered: ColorValue;
  /** The background color for a pressed list header.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  listHeaderBackgroundPressed: ColorValue;
}

/**
 * @deprecated These tokens are not part of the Fluent design system.
 */
export interface ControlColorTokens {
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultHoveredBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultHoveredContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultHoveredIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultFocusedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultFocusedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultFocusedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultFocusedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultPressedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultPressedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultPressedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultPressedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultDisabledBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultDisabledBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultDisabledContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultDisabledIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostHoveredBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostHoveredContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostHoveredIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostFocusedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostFocusedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostFocusedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostFocusedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostPressedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostPressedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostPressedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostPressedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostDisabledBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostDisabledBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostDisabledContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostDisabledIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedBackground: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedDisabledBorder: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedFocusedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedHoveredSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedPressedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultCheckedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultCheckedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultCheckedHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultCheckedHoveredContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostCheckedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostCheckedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostCheckedHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostCheckedHoveredContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostCheckedHoveredBorder: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostFocusedSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostHoveredSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  ghostPressedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultHoveredSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  defaultPressedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  checkboxBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  checkboxBackgroundDisabled: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  checkmarkColor: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  checkboxBorderColor: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  personaActivityRing: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
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
 * @deprecated These are not used in the Fluent design system
 */
export type Palette = PaletteTextColors & PaletteBackgroundColors & Partial<ControlColorTokens> & Partial<AliasColorTokens>;

/**
 * A partially specified color palette.
 * @deprecated These are not used in the Fluent design system
 */
export type PartialPalette = Partial<Palette>;

/**
 * A color, used when defining a visual element in a theme.
 */
export type Color = keyof Palette | ColorValue;
