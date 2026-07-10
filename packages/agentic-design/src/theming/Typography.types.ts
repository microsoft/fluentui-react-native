import type { TextProps, TextStyle } from 'react-native';

/**
 * A font family designation, made up of one or more font names or groupings
 * (comma-separated):
 *
 * - `Calibri Light`, `Calibri, Times`
 * - `Menlo, Monaco`, `Courier New`, `Courier`
 * - `Consolas`
 *
 * The font family expresses an ordered preference of fonts to use, working
 * from the first entry to the last. This "fallback" mechanism is necessary
 * because the availability of specific fonts varies between native platforms,
 * as well as between operating system versions.
 */
export type FontFamilyValue = string;

/**
 * A collection of named font families.
 *
 * The names express the fundamental character of the assigned font family. They
 * should be used when defining a theme.
 *
 * **NOTE:** `primary` and `secondary` are both meant to be assigned a 'normal' family.
 */
export interface FontFamilies {
  /**
   * Used by: Avatar (defaultAvatarTokens), Badge (badgeFontTokens), Button (defaultButtonFontTokens,
   *   defaultCompoundButtonFontTokens), Checkbox (defaultCheckboxTokens), Menu (defaultMenuGroupHeaderTokens,
   *   defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens, defaultMenuItemTokens), tester-core (Test)
   */
  primary: FontFamilyValue;
  /**
   * Used by: Button (defaultButtonFontTokens, defaultCompoundButtonFontTokens)
   */
  secondary: FontFamilyValue;
  cursive: FontFamilyValue;
  monospace: FontFamilyValue;
  numeric: FontFamilyValue;
  sansSerif: FontFamilyValue;
  serif: FontFamilyValue;
}

/**
 * A font family, used when defining a visual element in a theme.
 */
export type FontFamily = keyof FontFamilies | FontFamilyValue;

/**
 * A font size value, specified in CSS pixels (px).
 */
export type FontSizeValuePoints = number;

/**
 * A collection of named font sizes.
 *
 * The names express a spectrum of relative sizes. Words are used instead
 * of numbers to avoid implying anything about the size value, or its
 * relationship to size values near it.
 *
 * These names should be used when defining a theme.
 */
export interface FontSizes {
  caption: FontSizeValuePoints;
  secondary: FontSizeValuePoints;
  body: FontSizeValuePoints;
  subheader: FontSizeValuePoints;
  header: FontSizeValuePoints;
  hero: FontSizeValuePoints;
  heroLarge: FontSizeValuePoints;
}

/**
 * A font size, used when defining a visual element in a theme.
 */
export type FontSize = keyof FontSizes | FontSizeValuePoints;

/**
 * A font weight value.
 *
 * Smaller numbers yield a thinner, lighter font. Larger numbers yield a thicker, darker
 * font.
 */
export type FontWeightValue = TextStyle['fontWeight'];

/**
 * A collection of named font weights.
 *
 * The names express a spectrum of relative weights. Words are used instead
 * of numbers to avoid implying anything about the weight value, or its
 * relationship to weight values near it.
 *
 * These names should be used when defining a theme.
 */
export interface FontWeights {
  regular: FontWeightValue;
  semiBold: FontWeightValue;
}

/**
 * A font weight, used when defining a visual element in a theme.
 */
export type FontWeight = keyof FontWeights | FontWeightValue;

/**
 * A font line height value, specified in CSS pixels (px).
 */
export type FontLineHeight = number;

/**
 * A font letter spacing value, specified in points on Apple platforms and ems everywhere else.
 */
export type FontLetterSpacing = number;

/**
 * On iOS, the Dynamic Type ramp that this variant should conform to.
 */
export type FontDynamicTypeRamp = TextProps['dynamicTypeRamp'];

/**
 * A font variant value.
 */
export type VariantValue = {
  face: FontFamily;
  size: FontSize;
  weight: FontWeight;
  lineHeight?: FontLineHeight;
  letterSpacing?: FontLetterSpacing;
  dynamicTypeRamp?: FontDynamicTypeRamp;
};

/**
 * A collection of named font variants.
 */
export interface Variants {
  /**
   * Used by: Badge (badgeFontTokens), Chip (chipFontTokens), tester-core (BasicBadge, RedCaptionBold, StandardUsage,
   *   TextLegacyE2ETest, TextV1E2ETest, Wingdings)
   */
  captionStandard: VariantValue;
  /**
   * Used by: Badge (badgeFontTokens), Button (defaultButtonFontTokens, defaultCompoundButtonFontTokens), Chip
   *   (chipFontTokens), Link (settings), tester-core (OrangeSecondaryBold, StandardUsage, TimesNewRoman), Text
   *   (settings, useTextTokens)
   */
  secondaryStandard: VariantValue;
  /**
   * Used by: tester-core (StandardUsage)
   */
  secondarySemibold: VariantValue;
  /**
   * Used by: apple-theme (appleComponents), Button (defaultButtonFontTokens, defaultCompoundButtonFontTokens), Checkbox
   *   (defaultCheckboxTokens, settings), tester-core (StandardUsage, YellowBodyBold)
   */
  bodyStandard: VariantValue;
  /**
   * Used by: Button (defaultButtonFontTokens, defaultCompoundButtonFontTokens, settings), tester-core
   *   (CornerRadiusTestComponent, MenuPicker, PickerLabel, ShadowTestBox, ShadowWithDifferentPropsTestSection,
   *   StandardUsage, StrokeWidthTestComponent, Test)
   */
  bodySemibold: VariantValue;
  /**
   * Used by: RadioGroup (defaultRadioTokens, settings), tester-core (Georgia, GlobalSharedColorTokensSwatchList,
   *   GreenSubheaderBold, NativeDatePickerAndroidUsage, NativeDatePickeriOSUsage, StandardUsage, SubHeader)
   */
  subheaderStandard: VariantValue;
  /**
   * Used by: Button (defaultButtonFontTokens, defaultCompoundButtonFontTokens), tester-core (E2ECalloutTest,
   *   FocusZone2D, PickerLabel, StandardUsage, SubheaderText)
   */
  subheaderSemibold: VariantValue;
  /**
   * Used by: tester-core (BlueHeaderBold, CourierNew, Header, NativeDatePickerAndroidUsage, NativeDatePickeriOSUsage,
   *   StandardUsage, Test)
   */
  headerStandard: VariantValue;
  /**
   * Used by: tester-core (DrawerDefault, StandardUsage, Test)
   */
  headerSemibold: VariantValue;
  /**
   * Used by: tester-core (BrushScriptMT, Casual, Cursive, IndigoHeroBold, StandardUsage, overflowTestPageStyles)
   */
  heroStandard: VariantValue;
  /**
   * Used by: tester-core (StandardUsage, StyledMenuButton, Test)
   */
  heroSemibold: VariantValue;
  /**
   * Used by: tester-core (Arial, ArialBlack, Helvetica, Papyrus, PurpleHeroLargeBold, StandardUsage)
   */
  heroLargeStandard: VariantValue;
  /**
   * Used by: tester-core (Header, StandardUsage)
   */
  heroLargeSemibold: VariantValue;
  //v2 variants
  /**
   * Used by: Chip (defaultChipTokens), tester-core (V2Usage), Text (Caption1)
   */
  caption1?: VariantValue;
  /**
   * Used by: Button (defaultButtonFontTokens), tester-core (V2Usage), Text (Caption1Strong)
   */
  caption1Strong?: VariantValue;
  /**
   * Used by: Input (defaultInputTokens), tester-core (V2Usage), Text (Caption2)
   */
  caption2?: VariantValue;
  /**
   * Used by: Avatar (defaultAvatarTokens), Checkbox (defaultCheckboxTokens), Dropdown (defaultOptionTokens), Input
   *   (defaultInputTokens), Link (defaultLinkTokens), Menu (defaultMenuItemCheckboxTokens, defaultMenuItemRadioTokens,
   *   defaultMenuItemTokens), RadioGroup (defaultRadioTokens), Switch (defaultSwitchTokens), TabList
   *   (defaultTabTokens), tester-core (DrawerDefault, TabListViewTest, V2Usage), Text (Body1)
   */
  body1?: VariantValue;
  /**
   * Used by: Button (defaultButtonFontTokens, defaultFABTokens), RadioGroup (defaultRadioGroupTokens), TabList
   *   (defaultTabTokens), tester-core (Test, V2Usage, overflowTestPageStyles), Text (Body1Strong)
   */
  body1Strong?: VariantValue;
  /**
   * Used by: Chip (defaultChipTokens), TabList (defaultTabTokens), tester-core (V2Usage), Text (Body2)
   */
  body2?: VariantValue;
  /**
   * Used by: Button (defaultButtonFontTokens, defaultFABTokens), Notification (NotificationButton), tester-core
   *   (V2Usage), Text (Body2Strong)
   */
  body2Strong?: VariantValue;
  /**
   * Used by: Text (Subtitle1)
   */
  subtitle1?: VariantValue;
  /**
   * Used by: Text (Subtitle1Strong)
   */
  subtitle1Strong?: VariantValue;
  /**
   * Used by: TabList (defaultTabTokens), Text (Subtitle2)
   */
  subtitle2?: VariantValue;
  /**
   * Used by: RadioGroup (defaultRadioGroupTokens), tester-core (TextVariantDivider), Text (Subtitle2Strong)
   */
  subtitle2Strong?: VariantValue;
  /**
   * Used by: tester-core (V2Usage), Text (Title1)
   */
  title1?: VariantValue;
  /**
   * Used by: Text (Title1Strong)
   */
  title1Strong?: VariantValue;
  /**
   * Used by: tester-core (V2Usage), Text (Title2)
   */
  title2?: VariantValue;
  /**
   * Used by: tester-core (V2Usage), Text (Title3)
   */
  title3?: VariantValue;
  /**
   * Used by: tester-core (V2Usage), Text (LargeTitle)
   */
  largeTitle?: VariantValue;
  /**
   * Used by: tester-core (V2Usage), Text (Display)
   */
  display?: VariantValue;
}

/**
 * A font variant, used when defining a visual element in a theme.
 */
export type Variant = keyof Variants | VariantValue;

/**
 * A collection of typographic (font) information.
 *
 * When setting a font in a theme, choose a family, size and weight from
 * this collection.
 */

export interface TextStyling {
  families: FontFamilies;
  sizes: FontSizes;
  weights: FontWeights;
  variants: Variants;
}

export type Typography = TextStyling;

/**
 * A partially specified typography.
 */
export type PartialTypography = { [P in keyof Typography]?: Partial<Typography[P]> };
