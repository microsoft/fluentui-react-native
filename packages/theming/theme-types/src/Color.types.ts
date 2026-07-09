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
  /**
   * Used by: Checkbox (defaultCheckboxTokens), Notification (defaultNotificationTokens), PersonaCoin (_iconKeyProps),
   *   Shimmer (defaultShimmerTokens), tester-core (shadowTestPageStyles)
   */
  background: ColorValue;
  /**
   * Used by: tester-core (MenuPicker, ShadowTestBox, getThemedDropdownStyles, getThemedStyles, themePickerStyles), Text
   *   (useTextTokens)
   */
  bodyText: ColorValue;
  subText: ColorValue;
  /**
   * Used by: Menu (defaultMenuGroupHeaderTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens)
   */
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
   * Used by: tester-core (MenuPicker, ShadowTestBox, getThemedDropdownStyles, getThemedStyles, themePickerStyles), Text
   *   (useTextTokens)
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
   * Used by: Menu (defaultMenuGroupHeaderTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens)
   */
  disabledText: ColorValue;
  /** The default color for disabled text on the default background (bodyBackground).
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens), tester-core (StyledTextInput, getThemedDropdownStyles)
   */
  disabledBodyText: ColorValue;

  //// Invariants - slots that rarely change color theme-to-theme because the color has meaning

  /** The default color of error text, used on bodyBackground.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  errorText: ColorValue;
  /** The color of input text.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: tester-core (StandardUsage, StyledPicker, StyledSlider, StyledSwitch, StyledTextInput)
   */
  inputText: ColorValue;
  /** The color of placeholder text.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  inputPlaceholderText: ColorValue;

  //// Buttons

  /** Color of text in a standard button
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens), Icon (Icon)
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
   * Used by: tester-core (ShadowTestBox)
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
   * Used by: Checkbox (defaultCheckboxTokens), Notification (defaultNotificationTokens), PersonaCoin (_iconKeyProps),
   *   Shimmer (defaultShimmerTokens), tester-core (shadowTestPageStyles)
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
   * Used by: Shimmer (defaultShimmerTokens, shimmerName), tester-core (HeaderSeparator)
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
   * Used by: Checkbox (defaultCheckboxTokens)
   */
  focusBorder: ColorValue;
  /** The color of the border that provides contrast between an element, such as a card, and an emphasized background.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  variantBorder: ColorValue;

  //// Input controls slots (text fields, checkboxes, radios...)

  /** The border of a large input control in its resting, state; e.g. the box of dropdown.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: tester-core (getThemedStyles)
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
   * Used by: Button (defaultButtonColorTokens)
   */
  buttonBackground: ColorValue;
  /** Background of a checked standard button; e.g. bold/italicize/underline text button in toolbar
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: tester-core (Panel)
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
   * Used by: Button (defaultButtonColorTokens)
   */
  buttonBorder: ColorValue;
  /** Border of a standard button in focused state
   * @deprecated These tokens are not part of the Fluent design system.
   */
  buttonBorderFocused: ColorValue;
  /** Border of a disabled standard button
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens)
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
   * Used by: PersonaCoin (_ringProps)
   */
  accentButtonBackground: ColorValue;

  //// Menus, popups, etc

  /** The background of a menu.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemRadioTokens, defaultMenuItemTokens)
   */
  menuBackground: ColorValue;
  /** The divider between menu items.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: tester-core (TestListSeparator, getThemedStyles)
   */
  menuDivider: ColorValue;
  /** The default colors of icons in menus.
   * @deprecated These tokens are not part of the Fluent design system.
   */
  menuIcon: ColorValue;
  /** The background of a hovered menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemRadioTokens, defaultMenuItemTokens)
   */
  menuItemBackgroundHovered: ColorValue;
  /** The background of a pressed menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemRadioTokens, defaultMenuItemTokens)
   */
  menuItemBackgroundPressed: ColorValue;
  /** The text color of a menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioGroupTokens)
   */
  menuItemText: ColorValue;
  /** The text color of a hovered menu item.
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemRadioTokens, defaultMenuItemTokens)
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
   * Used by: tester-core (ThemePickers)
   */
  defaultIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultHoveredBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultHoveredContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultHoveredIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultFocusedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultFocusedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultFocusedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultFocusedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultPressedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultPressedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultPressedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultPressedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultDisabledBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultDisabledBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultDisabledContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  defaultDisabledIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens), component-generator (defaultComponentNameTokens)
   */
  ghostBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostHoveredBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostHoveredContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostHoveredIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostFocusedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostFocusedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostFocusedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostFocusedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostPressedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostPressedBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostPressedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostPressedIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostDisabledBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostDisabledBorder: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostDisabledContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultButtonColorTokens)
   */
  ghostDisabledIcon: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: tester-core (getThemedStyles)
   */
  brandedBackground: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   */
  brandedDisabledBorder: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  brandedSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  brandedFocusedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  brandedHoveredSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  brandedPressedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  defaultCheckedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  defaultCheckedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  defaultCheckedHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  defaultCheckedHoveredContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  ghostCheckedBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  ghostCheckedContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  ghostCheckedHoveredBackground: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  ghostCheckedHoveredContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  ghostCheckedHoveredBorder: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  ghostSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  ghostFocusedSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  ghostHoveredSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  ghostPressedSecondaryContent: ColorValue;

  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
   */
  defaultHoveredSecondaryContent: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: Button (defaultCompoundButtonColorTokens)
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
   * Used by: PersonaCoin (_ringProps)
   */
  personaActivityRing: ColorValue;
  /**
   * @deprecated These tokens are not part of the Fluent design system.
   * Used by: PersonaCoin (_ringProps)
   */
  personaActivityGlow: ColorValue;
}

export interface AliasColorTokens {
  /// Foreground colors

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens), Button (defaultButtonColorTokens), Checkbox (defaultCheckboxTokens), Chip
   *   (defaultChipColorTokens), Divider (colorsFromAppearance), Input (defaultInputTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens), RadioGroup
   *   (defaultRadioGroupTokens, defaultRadioTokens), Switch (defaultSwitchTokens), TabList (defaultTabColorTokens),
   *   tester-core (Panel, getThemedStyles)
   */
  neutralForeground1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), Menu (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens,
   *   defaultMenuItemTokens), TabList (defaultTabColorTokens), tester-core (getThemedStyles)
   */
  neutralForeground1Hover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), Menu (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens,
   *   defaultMenuItemTokens), TabList (defaultTabColorTokens)
   */
  neutralForeground1Pressed?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  neutralForeground1Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Button (defaultButtonColorTokens, defaultCompoundButtonColorTokens,
   *   defaultFABColorTokens), Checkbox (defaultCheckboxTokens), Chip (defaultChipColorTokens), Divider
   *   (colorsFromAppearance), Dropdown (defaultOptionTokens), Input (defaultInputTokens), Link (defaultLinkTokens),
   *   Menu (defaultMenuGroupHeaderTokens, defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens,
   *   defaultMenuItemTokens), Notification (defaultNotificationTokens), RadioGroup (defaultRadioTokens), Switch
   *   (defaultSwitchTokens), TabList (defaultTabColorTokens)
   */
  neutralForeground2?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultCompoundButtonColorTokens), Dropdown (defaultOptionTokens), Link (defaultLinkTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemTokens), TabList (defaultTabColorTokens)
   */
  neutralForeground2Hover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultCompoundButtonColorTokens), Dropdown (defaultOptionTokens), Link (defaultLinkTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemTokens), TabList (defaultTabColorTokens)
   */
  neutralForeground2Pressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2Selected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens)
   */
  neutralForeground2BrandHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens)
   */
  neutralForeground2BrandPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForeground2BrandSelected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens, defaultPresenceBadgeTokens,
   *   getGhostColorProps, getOutlineColorProps, getTintColorProps), Checkbox (defaultCheckboxTokens), Divider
   *   (colorsFromAppearance), Input (defaultInputTokens), Menu (defaultMenuItemTokens), RadioGroup (defaultRadioTokens)
   */
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

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens)
   */
  neutralForeground4?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultCompoundButtonColorTokens, defaultFABColorTokens), Checkbox
   *   (defaultCheckboxTokens), Dropdown (defaultOptionTokens), Link (defaultLinkTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens), RadioGroup
   *   (defaultRadioGroupTokens, defaultRadioTokens), Switch (defaultSwitchTokens), TabList (defaultTabColorTokens)
   */
  neutralForegroundDisabled?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Button (defaultButtonColorTokens), Checkbox (defaultCheckboxTokens), Chip (defaultChipColorTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens), RadioGroup
   *   (defaultRadioGroupTokens, defaultRadioTokens)
   */
  neutralForegroundDisabled1?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Chip (defaultChipColorTokens), Notification (defaultNotificationTokens)
   */
  neutralForegroundDisabled2?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Avatar (defaultAvatarTokens), Button (defaultButtonColorTokens, defaultFABColorTokens), Checkbox
   *   (defaultCheckboxTokens), Chip (defaultChipColorTokens), Menu (defaultMenuItemCheckboxTokens)
   */
  neutralForegroundOnColor?: ColorValue;

  // TODO #2440: Add to android
  /** @platform iOS */
  neutralForegroundDarkStatic?: ColorValue;

  // TODO #2440: Add to android
  /**
   * @platform iOS
   * Used by: Badge (defaultCounterBadgeColorTokens)
   */
  neutralForegroundLightStatic?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens, getFilledColorProps), Button
   *   (defaultButtonColorTokens, defaultCompoundButtonColorTokens), Checkbox (defaultCheckboxTokens), Menu
   *   (defaultMenuItemCheckboxTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  neutralForegroundOnBrand?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultCompoundButtonColorTokens), Checkbox (defaultCheckboxTokens),
   *   Switch (defaultSwitchTokens)
   */
  neutralForegroundOnBrandHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultCompoundButtonColorTokens), Checkbox (defaultCheckboxTokens),
   *   Menu (defaultMenuItemCheckboxTokens), Switch (defaultSwitchTokens)
   */
  neutralForegroundOnBrandPressed?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  neutralForegroundOnBrandSelected?: ColorValue;

  // TODO: remove definition from Android
  /**
   * @platform android, macOS, win32, windows
   * Used by: Badge (getFilledColorProps), Switch (defaultSwitchTokens)
   */
  neutralForegroundInverted?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Link (defaultLinkTokens), Switch (defaultSwitchTokens)
   */
  neutralForegroundInvertedLink?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Link (defaultLinkTokens), Switch (defaultSwitchTokens)
   */
  neutralForegroundInvertedLinkHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Link (defaultLinkTokens), Switch (defaultSwitchTokens)
   */
  neutralForegroundInvertedLinkPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralForegroundInvertedLinkSelected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Link (defaultLinkTokens)
   */
  brandForegroundLink?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Link (defaultLinkTokens)
   */
  brandForegroundLinkHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Link (defaultLinkTokens)
   */
  brandForegroundLinkPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  brandForegroundLinkSelected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: TabList (defaultTabColorTokens)
   */
  compoundBrandForeground1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: TabList (defaultTabColorTokens)
   */
  compoundBrandForeground1Hover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: TabList (defaultTabColorTokens)
   */
  compoundBrandForeground1Pressed?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens), Button (defaultButtonColorTokens,
   *   defaultFABColorTokens), Chip (defaultChipColorTokens), Divider (colorsFromAppearance), Input
   *   (defaultInputTokens), Link (defaultLinkTokens), Menu (defaultMenuItemRadioTokens), Notification
   *   (defaultNotificationTokens), RadioGroup (defaultRadioTokens)
   */
  brandForeground1?: ColorValue;

  /**
   * @platform android, iOS, macOS
   * Used by: Button (defaultButtonColorTokens, defaultFABColorTokens), Link (defaultLinkTokens)
   */
  brandForeground1Pressed?: ColorValue;

  /** @platform android, iOS, macOS */
  brandForeground1Selected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens)
   */
  brandForeground2?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Chip (defaultChipColorTokens), Notification (defaultNotificationTokens)
   */
  brandForegroundTint?: ColorValue;

  // TODO: rename to brandForegroundDisabled1
  /**
   * @platform android, iOS
   * Used by: Button (defaultButtonColorTokens), Chip (defaultChipColorTokens), Link (defaultLinkTokens), Menu
   *   (defaultMenuItemCheckboxTokens)
   */
  brandForeground1Disabled?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Notification (defaultNotificationTokens)
   */
  brandForegroundDisabled1?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Menu (defaultMenuItemRadioTokens), RadioGroup (defaultRadioTokens)
   */
  brandForegroundDisabled2?: ColorValue;

  // Background colors

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens, defaultPresenceBadgeTokens), Button
   *   (defaultButtonColorTokens, defaultFABColorTokens), Checkbox (defaultCheckboxTokens), Chip
   *   (defaultChipColorTokens), Dropdown (defaultOptionTokens), Input (defaultInputTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens, defaultMenuListTokens),
   *   Notification (defaultNotificationTokens), RadioGroup (defaultRadioTokens), tester-core (getThemedStyles)
   */
  neutralBackground1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), Dropdown (defaultOptionTokens), Menu (defaultMenuItemCheckboxTokens,
   *   defaultMenuItemRadioTokens, defaultMenuItemTokens), tester-core (getThemedStyles)
   */
  neutralBackground1Hover?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultFABColorTokens), Checkbox (defaultCheckboxTokens), Dropdown
   *   (defaultOptionTokens), Menu (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens)
   */
  neutralBackground1Pressed?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  neutralBackground1Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), Drawer (defaultDrawerTokens)
   */
  neutralBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground2Hover?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens)
   */
  neutralBackground2Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground2Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens)
   */
  neutralBackground3?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground3Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground3Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground3Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens), Notification (defaultNotificationTokens)
   */
  neutralBackground4?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground4Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground4Pressed?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground4Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens), Button (defaultButtonColorTokens,
   *   defaultFABColorTokens), Chip (defaultChipColorTokens), Notification (defaultNotificationTokens), Switch
   *   (defaultSwitchTokens)
   */
  neutralBackground5?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralBackground5Hover?: ColorValue;

  /** @platform android, iOS, macOS, win32, windows */
  neutralBackground5Pressed?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
  neutralBackground5Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Chip (defaultChipColorTokens)
   */
  neutralBackground6?: ColorValue;

  /** @platform iOS, android */
  neutralBackgroundCanvas?: ColorValue;

  /** @platform iOS, android */
  neutralBackgroundDarkStatic?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (getFilledColorProps), Spinner (defaultSpinnerTokens)
   */
  neutralBackgroundInverted?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultFABColorTokens), Checkbox (defaultCheckboxTokens), RadioGroup
   *   (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  neutralBackgroundDisabled?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Switch (defaultSwitchTokens)
   */
  neutralBackgroundLightStatic?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Switch (defaultSwitchTokens)
   */
  neutralBackgroundLightStaticDisabled?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), TabList (defaultTabColorTokens)
   */
  subtleBackground?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), TabList (defaultTabColorTokens)
   */
  subtleBackgroundHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), TabList (defaultTabColorTokens)
   */
  subtleBackgroundPressed?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  subtleBackgroundSelected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens, getTintColorProps), Menu (defaultMenuItemCheckboxTokens,
   *   defaultMenuItemRadioTokens, defaultMenuItemTokens, defaultMenuListTokens), Shimmer (defaultShimmerTokens), Switch
   *   (defaultSwitchTokens), TabList (defaultTabColorTokens, useTabSlotProps)
   */
  transparentBackground?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: TabList (defaultTabColorTokens)
   */
  transparentBackgroundHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: TabList (defaultTabColorTokens)
   */
  transparentBackgroundPressed?: ColorValue;

  /** @platform macOS, win32, windows */
  transparentBackgroundSelected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Button (defaultButtonColorTokens, defaultFABColorTokens), Checkbox
   *   (defaultCheckboxTokens), Chip (defaultChipColorTokens), component-generator (defaultComponentNameTokens), Menu
   *   (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens), RadioGroup (defaultRadioTokens), Switch
   *   (defaultSwitchTokens), tester-core (getThemedStyles)
   */
  brandBackground?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens),
   *   Switch (defaultSwitchTokens)
   */
  brandBackgroundHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultFABColorTokens), Checkbox (defaultCheckboxTokens), Menu
   *   (defaultMenuItemCheckboxTokens), RadioGroup (defaultRadioTokens)
   */
  brandBackgroundPressed?: ColorValue;

  /**
   * @platform macOS
   * Used by: Button (defaultButtonColorTokens), Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemCheckboxTokens,
   *   defaultMenuItemRadioTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  brandBackgroundDisabled?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultToggleButtonColorTokens)
   */
  brandBackgroundSelected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), Switch (defaultSwitchTokens)
   */
  compoundBrandBackground1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  compoundBrandBackground1Hover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens), TabList
   *   (defaultTabColorTokens)
   */
  compoundBrandBackground1Pressed?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens)
   */
  brandBackgroundStatic?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens)
   */
  brandBackground2?: ColorValue;

  /** @platform android, iOS */
  brandBackground2Pressed?: ColorValue;

  /** @platform android, iOS */
  brandBackground2Selected?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Chip (defaultChipColorTokens)
   */
  brandBackground3?: ColorValue;

  /**
   * @platform android, iOS
   * Used by: Avatar (defaultAvatarTokens), Chip (defaultChipColorTokens), Notification (defaultNotificationTokens)
   */
  brandBackgroundTint?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /**
   * @platform android
   * Used by: Chip (defaultChipColorTokens)
   */
  brandBackgroundInverted?: ColorValue;

  // TODO #2440: remove from Android and delete token defintion
  /** @platform android */
  brandBackgroundInvertedDisabled?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Shimmer (defaultShimmerTokens, shimmerName)
   */
  neutralStencil1?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Shimmer (defaultShimmerTokens, shimmerName)
   */
  neutralStencil2?: ColorValue;

  // Stroke

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens), Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemCheckboxTokens,
   *   defaultMenuItemRadioTokens, useMenuPopoverTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  neutralStrokeAccessible?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  neutralStrokeAccessibleHover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens)
   */
  neutralStrokeAccessiblePressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStrokeAccessibleSelected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Button (defaultButtonColorTokens, defaultToggleButtonColorTokens), Divider
   *   (colorsFromAppearance), Drawer (defaultDrawerTokens), Input (defaultInputTokens), Menu (defaultMenuDividerTokens,
   *   useMenuPopoverTokens), TabList (defaultTabColorTokens), tester-core (getThemedStyles)
   */
  neutralStroke1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), TabList (defaultTabColorTokens)
   */
  neutralStroke1Hover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), TabList (defaultTabColorTokens)
   */
  neutralStroke1Pressed?: ColorValue;

  /** @platform macOS, win32, windows */
  neutralStroke1Selected?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens), Button (defaultButtonColorTokens), Divider (colorsFromAppearance,
   *   useDividerTokens), Menu (defaultMenuDividerTokens), Notification (defaultNotificationTokens), Separator
   *   (defaultSeparatorTokens), Spinner (defaultSpinnerTokens)
   */
  neutralStroke2?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Divider (colorsFromAppearance), Menu (useMenuPopoverTokens)
   */
  neutralStroke3?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens), Checkbox (defaultCheckboxTokens), Menu (defaultMenuItemCheckboxTokens,
   *   defaultMenuItemRadioTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens), TabList
   *   (defaultTabColorTokens)
   */
  neutralStrokeDisabled?: ColorValue;

  /** @platform iOS, android */
  neutralStrokeFocus1?: ColorValue;

  /** @platform iOS, android */
  neutralStrokeFocus2?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Badge (defaultCounterBadgeColorTokens), Button (defaultButtonColorTokens, defaultFABColorTokens)
   */
  strokeFocus1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Button (defaultButtonColorTokens, defaultFABColorTokens), Link (defaultLinkTokens), RadioGroup
   *   (defaultRadioTokens), Switch (defaultSwitchTokens), tester-core (getThemedStyles)
   */
  strokeFocus2?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Avatar (defaultAvatarTokens), Button (defaultButtonColorTokens), Divider (colorsFromAppearance), Input
   *   (defaultInputTokens), Spinner (defaultSpinnerTokens)
   */
  brandStroke1?: ColorValue;

  /**
   * @platform android, iOS, macOS
   * Used by: Button (defaultButtonColorTokens)
   */
  brandStroke1Pressed?: ColorValue;

  /** @platform android, iOS, macOS */
  brandStroke1Selected?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Badge (defaultBadgeColorTokens), Spinner (defaultSpinnerTokens)
   */
  brandStroke2?: ColorValue;

  /** @platform android, iOS */
  brandStrokeTint?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: RadioGroup (defaultRadioTokens), TabList (defaultTabColorTokens)
   */
  compoundBrandStroke1?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens), TabList (defaultTabColorTokens)
   */
  compoundBrandStroke1Hover?: ColorValue;

  /**
   * @platform macOS, win32, windows
   * Used by: Checkbox (defaultCheckboxTokens), RadioGroup (defaultRadioTokens), TabList (defaultTabColorTokens)
   */
  compoundBrandStroke1Pressed?: ColorValue;

  /**
   * @platform windows
   * Used by: Avatar (defaultAvatarTokens), Badge (defaultBadgeColorTokens, getFilledColorProps, getOutlineColorProps,
   *   getTintColorProps), Button (defaultButtonColorTokens), Menu (useMenuPopoverTokens), RadioGroup
   *   (defaultRadioTokens)
   */
  transparentStroke?: ColorValue;

  /** @platform  */
  transparentStrokeInteractive?: ColorValue;

  /**
   * @platform
   * Used by: Button (defaultButtonColorTokens)
   */
  transparentStrokeDisabled?: ColorValue;

  /// Red

  /** @deprecated */
  redBackground1?: ColorValue;

  /** @deprecated */
  redBackground2?: ColorValue;

  /** @deprecated */
  redBackground3?: ColorValue;

  /**
   * @deprecated
   * Used by: Checkbox (defaultCheckboxTokens)
   */
  redForeground1?: ColorValue;

  /** @deprecated */
  redForeground2?: ColorValue;

  /**
   * @deprecated
   * Used by: RadioGroup (defaultRadioGroupTokens)
   */
  redForeground3?: ColorValue;

  /** @deprecated */
  redBorderActive?: ColorValue;

  /** @deprecated */
  redBorder1?: ColorValue;

  /** @deprecated */
  redBorder2?: ColorValue;

  /// Error, status, and presence tokens

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens), Notification (defaultNotificationTokens)
   */
  dangerBackground1?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Badge (defaultCounterBadgeColorTokens), Chip (defaultChipColorTokens)
   */
  dangerBackground2?: ColorValue;

  /** @platform macOS, win32, windows  */
  dangerBackground3?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens), Input (defaultInputTokens), Notification (defaultNotificationTokens)
   */
  dangerForeground1?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Input (defaultInputTokens)
   */
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

  /**
   * @platform android, iOS
   * Used by: Input (defaultInputTokens)
   */
  dangerStroke1?: ColorValue;

  /**
   * @platform iOS, macOS, android, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
  successBackground1?: ColorValue;

  /**
   * @platform iOS, android, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
  successBackground2?: ColorValue;

  /** @platform macOS, win32, windows  */
  successBackground3?: ColorValue;

  /**
   * @platform iOS, android, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
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

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens), Notification (defaultNotificationTokens)
   */
  warningBackground1?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
  warningBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  warningBackground3?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens), Notification (defaultNotificationTokens)
   */
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

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
  severeBackground1?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
  severeBackground2?: ColorValue;

  /** @platform macOS, win32, windows */
  severeBackground3?: ColorValue;

  /**
   * @platform android, iOS, macOS, win32, windows
   * Used by: Chip (defaultChipColorTokens)
   */
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

  /**
   * @platform iOS, android
   * Used by: Badge (defaultPresenceBadgeTokens)
   */
  presenceAway?: ColorValue;

  /**
   * @platform iOS, android
   * Used by: Badge (defaultPresenceBadgeTokens)
   */
  presenceDnd?: ColorValue;

  /**
   * @platform iOS, android
   * Used by: Badge (defaultPresenceBadgeTokens)
   */
  presenceAvailable?: ColorValue;

  /**
   * @platform iOS, android
   * Used by: Badge (defaultPresenceBadgeTokens)
   */
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
