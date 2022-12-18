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
  primary: FontFamilyValue;
  secondary: FontFamilyValue;
  cursive: FontFamilyValue;
  monospace: FontFamilyValue;
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
export type FontWeightValue = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

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
export type FontDynamicTypeRamp = string; // TODO(#2268): Import type from RN directly

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
  captionStandard: VariantValue;
  secondaryStandard: VariantValue;
  secondarySemibold: VariantValue;
  bodyStandard: VariantValue;
  bodySemibold: VariantValue;
  subheaderStandard: VariantValue;
  subheaderSemibold: VariantValue;
  headerStandard: VariantValue;
  headerSemibold: VariantValue;
  heroStandard: VariantValue;
  heroSemibold: VariantValue;
  heroLargeStandard: VariantValue;
  heroLargeSemibold: VariantValue;
  //v2 variants
  caption1?: VariantValue;
  caption1Strong?: VariantValue;
  caption2?: VariantValue;
  body1?: VariantValue;
  body1Strong?: VariantValue;
  body2?: VariantValue;
  body2Strong?: VariantValue;
  subtitle1?: VariantValue;
  subtitle1Strong?: VariantValue;
  subtitle2?: VariantValue;
  subtitle2Strong?: VariantValue;
  title1?: VariantValue;
  title1Strong?: VariantValue;
  title2?: VariantValue;
  title3?: VariantValue;
  largeTitle?: VariantValue;
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
