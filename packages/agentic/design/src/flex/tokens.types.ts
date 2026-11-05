import type { ColorValue, TextStyle, ViewStyle, DimensionValue } from 'react-native';

type FontWeight = TextStyle['fontWeight'];
type FontSize = TextStyle['fontSize'];
type BorderRadius = ViewStyle['borderRadius'];
type StrokeWidth = ViewStyle['borderWidth'];

/** A color that selects light at index zero and dark at index one. */
export type ColorTuple = readonly [light: ColorValue, dark: ColorValue];

/** One authored color for every scheme, or a light/dark tuple. */
export type ColorEntry = ColorValue | ColorTuple;

/**
 * How omitted interaction states derive from rest. Standard and inverted use
 * opposite scheme-dependent lightness directions. Fixed requires explicit
 * states for derivable literal colors.
 */
export type InteractiveColorType = 'standard' | 'inverted' | 'fixed';

/** An authored color with optional explicit interaction states. */
export type InteractiveColorOptions = {
  rest: ColorEntry;
  hover?: ColorEntry;
  pressed?: ColorEntry;
  type?: InteractiveColorType;
};

/** Any authored Flex color. */
export type FlexColorInput = ColorEntry | InteractiveColorOptions;

/**
 * A normalized, frozen authored color. Omitted states stay omitted until the
 * color resolves for an appearance.
 */
export type FlexColorDescription = {
  readonly rest: ColorEntry;
  readonly hover?: ColorEntry;
  readonly pressed?: ColorEntry;
  readonly type: InteractiveColorType;
};

/**
 * A resolved Flex color for one appearance. Omitted states are computed on
 * first read and memoized.
 */
export type InteractiveColor = {
  readonly rest: ColorValue;
  readonly hover: ColorValue;
  readonly pressed: ColorValue;
};

/**
 * Every semantic color token, resolved for one appearance.
 */
export type SemanticColors = {
  // surface / neutral
  surfaceNeutralFarther: InteractiveColor;
  surfaceNeutralFar: InteractiveColor;
  surfaceNeutralNear: InteractiveColor;
  surfaceNeutralNearer: InteractiveColor;
  surfaceNeutralTranslucent: InteractiveColor;

  // background / neutral
  backgroundNeutralHeavy: InteractiveColor;
  backgroundNeutralLoud: InteractiveColor;
  backgroundNeutralSoft: InteractiveColor;
  backgroundNeutralSubtle: InteractiveColor;
  backgroundNeutralTransparent: InteractiveColor;
  backgroundNeutralTranslucent: InteractiveColor;

  // background / brand
  backgroundBrandHeavy: InteractiveColor;
  backgroundBrandLoud: InteractiveColor;
  backgroundBrandSoft: InteractiveColor;
  backgroundBrandSubtle: InteractiveColor;
  backgroundBrandTransparent: InteractiveColor;

  // background / danger
  backgroundDangerLoud: InteractiveColor;
  backgroundDangerSoft: InteractiveColor;
  backgroundDangerSubtle: InteractiveColor;

  // background / warning
  backgroundWarningLoud: InteractiveColor;
  backgroundWarningSoft: InteractiveColor;
  backgroundWarningSubtle: InteractiveColor;

  // background / success
  backgroundSuccessLoud: InteractiveColor;
  backgroundSuccessSoft: InteractiveColor;
  backgroundSuccessSubtle: InteractiveColor;

  // stroke / neutral
  strokeNeutralHeavy: InteractiveColor;
  strokeNeutralLoud: InteractiveColor;
  strokeNeutralSoft: InteractiveColor;
  strokeNeutralSubtle: InteractiveColor;
  strokeNeutralTransparent: InteractiveColor;
  strokeNeutralOnloud: InteractiveColor;

  // stroke / brand
  strokeBrandLoud: InteractiveColor;
  strokeBrandSoft: InteractiveColor;
  strokeBrandSubtle: InteractiveColor;
  strokeBrandOnloud: InteractiveColor;

  // stroke / danger
  strokeDangerLoud: InteractiveColor;
  strokeDangerSoft: InteractiveColor;
  strokeDangerSubtle: InteractiveColor;
  strokeDangerOnloud: InteractiveColor;

  // stroke / warning
  strokeWarningLoud: InteractiveColor;
  strokeWarningSoft: InteractiveColor;
  strokeWarningSubtle: InteractiveColor;
  strokeWarningOnloud: InteractiveColor;

  // stroke / success
  strokeSuccessLoud: InteractiveColor;
  strokeSuccessSoft: InteractiveColor;
  strokeSuccessSubtle: InteractiveColor;
  strokeSuccessOnloud: InteractiveColor;

  // foreground / neutral
  foregroundNeutralPrimary: InteractiveColor;
  foregroundNeutralSecondary: InteractiveColor;
  foregroundNeutralTertiary: InteractiveColor;
  foregroundNeutralOnloud: InteractiveColor;

  // foreground / brand
  foregroundBrandPrimary: InteractiveColor;
  foregroundBrandOnloud: InteractiveColor;

  // foreground / danger
  foregroundDangerPrimary: InteractiveColor;
  foregroundDangerOnloud: InteractiveColor;

  // foreground / warning
  foregroundWarningPrimary: InteractiveColor;
  foregroundWarningOnloud: InteractiveColor;

  // foreground / success
  foregroundSuccessPrimary: InteractiveColor;
  foregroundSuccessOnloud: InteractiveColor;

  // fixed
  fixedWhite: InteractiveColor;
  fixedBlack: InteractiveColor;

  // expression / accent
  expressionAccentHeavy: InteractiveColor;
  expressionAccentLoud: InteractiveColor;
  expressionAccentSoft: InteractiveColor;
  expressionAccentSubtle: InteractiveColor;

  // expression / achromatic
  expressionAchromaticHeavy: InteractiveColor;
  expressionAchromaticSubtle: InteractiveColor;

  // expression / gray
  expressionGrayHeavy: InteractiveColor;
  expressionGrayLoud: InteractiveColor;
  expressionGraySoft: InteractiveColor;
  expressionGraySubtle: InteractiveColor;

  // expression / navy
  expressionNavyHeavy: InteractiveColor;
  expressionNavyLoud: InteractiveColor;
  expressionNavySoft: InteractiveColor;
  expressionNavySubtle: InteractiveColor;

  // expression / blue
  expressionBlueHeavy: InteractiveColor;
  expressionBlueLoud: InteractiveColor;
  expressionBlueSoft: InteractiveColor;
  expressionBlueSubtle: InteractiveColor;

  // expression / green
  expressionGreenHeavy: InteractiveColor;
  expressionGreenLoud: InteractiveColor;
  expressionGreenSoft: InteractiveColor;
  expressionGreenSubtle: InteractiveColor;

  // expression / lime
  expressionLimeHeavy: InteractiveColor;
  expressionLimeLoud: InteractiveColor;
  expressionLimeSoft: InteractiveColor;
  expressionLimeSubtle: InteractiveColor;

  // expression / yellow
  expressionYellowHeavy: InteractiveColor;
  expressionYellowLoud: InteractiveColor;
  expressionYellowSoft: InteractiveColor;
  expressionYellowSubtle: InteractiveColor;

  // expression / pumpkin
  expressionPumpkinHeavy: InteractiveColor;
  expressionPumpkinLoud: InteractiveColor;
  expressionPumpkinSoft: InteractiveColor;
  expressionPumpkinSubtle: InteractiveColor;

  // expression / red
  expressionRedHeavy: InteractiveColor;
  expressionRedLoud: InteractiveColor;
  expressionRedSoft: InteractiveColor;
  expressionRedSubtle: InteractiveColor;

  // expression / pink
  expressionPinkHeavy: InteractiveColor;
  expressionPinkLoud: InteractiveColor;
  expressionPinkSoft: InteractiveColor;
  expressionPinkSubtle: InteractiveColor;

  // expression / purple
  expressionPurpleHeavy: InteractiveColor;
  expressionPurpleLoud: InteractiveColor;
  expressionPurpleSoft: InteractiveColor;
  expressionPurpleSubtle: InteractiveColor;

  // overlay
  overlayNeutralTranslucent: InteractiveColor;

  // material / background
  materialBackgroundThick: InteractiveColor;
  materialBackgroundRegular: InteractiveColor;
  materialBackgroundThin: InteractiveColor;

  // disabled
  backgroundNeutralDisabled: InteractiveColor;
  backgroundNeutralHeavyDisabled: InteractiveColor;
  backgroundNeutralSubtleDisabled: InteractiveColor;
  strokeNeutralDisabled: InteractiveColor;
  foregroundNeutralDisabled: InteractiveColor;

  // focus strokes
  strokeFocusInner: InteractiveColor;
  strokeFocusOuter: InteractiveColor;

  // shadow
  shadow: InteractiveColor;
};

/** A semantic color token name. */
export type SemanticColorName = keyof SemanticColors;

/** One selected color value for each semantic color token. */
export type SemanticColorTokenValues = { [Name in SemanticColorName]: ColorValue };

/** Authored semantic colors. `undefined` means no override. */
export type PartialSemanticColors = { [Name in SemanticColorName]?: FlexColorInput };

/** Normalized authored semantic colors. */
export type SemanticColorDescriptions = { readonly [Name in SemanticColorName]: FlexColorDescription };

/** One shadow layer. Offsets and blur are density-independent pixels. */
export type FlexShadowLayer = {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly color: ColorValue;
};

/**
 * A layered shadow, ordered like CSS `box-shadow`: the first layer is the
 * contour and the last is the key shadow.
 */
export type FlexShadow = readonly FlexShadowLayer[];

/** One authored shadow for every scheme, or a light/dark tuple of shadows. */
export type FlexShadowEntry = FlexShadow | readonly [light: FlexShadow, dark: FlexShadow];

/**
 * The semantic shadow token set, resolved for one appearance.
 */
export type SemanticShadows = {
  lowest: FlexShadow;
  lower: FlexShadow;
  low: FlexShadow;
  high: FlexShadow;
  higher: FlexShadow;
  highest: FlexShadow;
};

/** Authored semantic shadows. Each entry may select a shadow per scheme. */
export type SemanticShadowEntries = { [Name in keyof SemanticShadows]: FlexShadowEntry };

/**
 * Semantic font weight tokens.
 *
 * Source of truth: `dev/web/flex-themes/css/semantic.css`.
 */
export type SemanticFontWeights = {
  functionalRegular: FontWeight;
  functionalMedium: FontWeight;
  functionalSemibold: FontWeight;
  functionalBold: FontWeight;
  contentRegular: FontWeight;
  contentMedium: FontWeight;
  contentSemibold: FontWeight;
  contentBold: FontWeight;
  contentEditorialRegular: FontWeight;
  contentEditorialMedium: FontWeight;
  contentEditorialSemibold: FontWeight;
  contentEditorialBold: FontWeight;
};

export type SemanticFontFamilies = {
  functional: string;
  content: string;
  contentEditorial: string;
  contentCode: string;
};

export type SemanticFontSizes = {
  functionalDisplay: FontSize;
  functionalPagetitle: FontSize;
  functionalTitleLarge: FontSize;
  functionalTitleMedium: FontSize;
  functionalTitleSmall: FontSize;
  functionalSubtitle: FontSize;
  functionalBodyLarge: FontSize;
  functionalBodyMedium: FontSize;
  functionalBodySmall: FontSize;
  functionalCaption: FontSize;
  contentStatement: FontSize;
  contentExpressiveLarge: FontSize;
  contentExpressiveMedium: FontSize;
  contentExpressiveSmall: FontSize;
  contentH1: FontSize;
  contentH2: FontSize;
  contentH3: FontSize;
  contentH4: FontSize;
  contentH5: FontSize;
  contentSubheadline: FontSize;
  contentParagraphLarge: FontSize;
  contentParagraphMedium: FontSize;
  contentParagraphSmall: FontSize;
  contentSubtext: FontSize;
  contentTable: FontSize;
  contentCode: FontSize;
};

export type SemanticLineHeights = {
  functionalDisplay: number;
  functionalPagetitle: number;
  functionalTitleLarge: number;
  functionalTitleMedium: number;
  functionalTitleSmall: number;
  functionalSubtitle: number;
  functionalBodyLarge: number;
  functionalBodyMedium: number;
  functionalBodySmall: number;
  functionalCaption: number;
  contentStatement: number;
  contentExpressiveLarge: number;
  contentExpressiveMedium: number;
  contentExpressiveSmall: number;
  contentH1: number;
  contentH2: number;
  contentH3: number;
  contentH4: number;
  contentH5: number;
  contentSubheadline: number;
  contentParagraphLarge: number;
  contentParagraphMedium: number;
  contentParagraphSmall: number;
  contentSubtext: number;
  contentTable: number;
  contentCode: number;
};

export type SemanticBorderRadii = {
  base100: BorderRadius;
  base200: BorderRadius;
  base300: BorderRadius;
  base400: BorderRadius;
  base600: BorderRadius;
  base700: BorderRadius;
  circular: BorderRadius;
};

export type SemanticSpacing = {
  componentBase50: DimensionValue;
  componentBase100: DimensionValue;
  componentBase150: DimensionValue;
  componentBase200: DimensionValue;
  componentBase250: DimensionValue;
  componentBase300: DimensionValue;
  componentBase400: DimensionValue;
  componentBase500: DimensionValue;
  componentBase600: DimensionValue;
  componentBase700: DimensionValue;
  componentBase800: DimensionValue;
  layoutBase100: DimensionValue;
  layoutBase200: DimensionValue;
  layoutBase300: DimensionValue;
  layoutBase400: DimensionValue;
  layoutBase450: DimensionValue;
  layoutBase500: DimensionValue;
  layoutBase600: DimensionValue;
  layoutBase700: DimensionValue;
  layoutBase800: DimensionValue;
  layoutBase1000: DimensionValue;
  layoutBase1200: DimensionValue;
};

export type SemanticStrokeWidths = {
  thin: StrokeWidth;
  thick: StrokeWidth;
  thicker: StrokeWidth;
  thickest: StrokeWidth;
};

/** A cubic Bézier easing curve as `[x1, y1, x2, y2]`, the arguments of `Easing.bezier`. */
export type FlexEasing = readonly [x1: number, y1: number, x2: number, y2: number];

/**
 * Semantic motion tokens. Durations are milliseconds.
 */
export type SemanticMotion = {
  durationBase50: number;
  durationBase100: number;
  durationBase200: number;
  durationBase300: number;
  durationBase500: number;
  durationBase1000: number;
  easingFunctionalEnter: FlexEasing;
  easingFunctionalExit: FlexEasing;
  easingFunctionalTransition: FlexEasing;
  easingFunctionalLinear: FlexEasing;
  easingExpressiveEnter: FlexEasing;
  easingExpressiveExit: FlexEasing;
  easingExpressiveTransition: FlexEasing;
};

/**
 * The complete, grouped Flex token set. Category prefixes are represented by
 * sub-objects and removed from the token names inside each category.
 */
export type FlexTokens = {
  color: SemanticColors;
  shadow: SemanticShadows;
  fontWeight: SemanticFontWeights;
  fontFamily: SemanticFontFamilies;
  fontSize: SemanticFontSizes;
  lineHeight: SemanticLineHeights;
  borderRadius: SemanticBorderRadii;
  spacing: SemanticSpacing;
  strokeWidth: SemanticStrokeWidths;
  motion: SemanticMotion;
};

export type SemanticTokens = FlexTokens;

type NonColorFlexTokenGroup = Exclude<keyof FlexTokens, 'color'>;

/** Authored non-color groups. Shadows may select a value per scheme. */
type AuthoredFlexTokenGroups = Omit<FlexTokens, 'color' | 'shadow'> & { shadow: SemanticShadowEntries };

/**
 * Authored Flex token overrides. Each color and shadow is an atomic
 * replacement; other non-color groups deep merge.
 */
export type PartialFlexTokens = { color?: PartialSemanticColors } & {
  [Group in NonColorFlexTokenGroup]?: Partial<AuthoredFlexTokenGroups[Group]>;
};

/** A complete authored Flex token set. */
export type CompleteFlexTokenInput = { color: { [Name in SemanticColorName]: FlexColorInput } } & Pick<
  AuthoredFlexTokenGroups,
  NonColorFlexTokenGroup
>;

/**
 * A complete, normalized authored token set before appearance resolution.
 * Recipes receive this form.
 */
export type FlexTokenDescription = { readonly color: SemanticColorDescriptions } & {
  readonly [Group in NonColorFlexTokenGroup]: AuthoredFlexTokenGroups[Group];
};

/**
 * These are flex tokens from web that are not supported on native.
 */
export type UnsupportedFlexTokens = {
  letterSpacing: {
    functionalDisplay: string;
    functionalPagetitle: string;
    functionalTitleLarge: string;
    functionalTitleMedium: string;
    functionalTitleSmall: string;
    functionalSubtitle: string;
    functionalBodyLarge: string;
    functionalBodyMedium: string;
    functionalBodySmall: string;
    functionalCaption: string;
    contentStatement: string;
    contentExpressiveLarge: string;
    contentExpressiveMedium: string;
    contentExpressiveSmall: string;
    contentH1: string;
    contentH2: string;
    contentH3: string;
    contentH4: string;
    contentH5: string;
    contentSubheadline: string;
    contentParagraphLarge: string;
    contentParagraphMedium: string;
    contentParagraphSmall: string;
    contentSubtext: string;
    contentTable: string;
    contentCode: string;
  };
};
