import type { ColorValue, TextStyle, ViewStyle, DimensionValue } from 'react-native';
import type { ShadowToken } from '../theming/types/Shadow.types';

type FontWeight = TextStyle['fontWeight'];
type FontSize = TextStyle['fontSize'];
type BorderRadius = ViewStyle['borderRadius'];
type StrokeWidth = ViewStyle['borderWidth'];

/**
 * Every semantic color token's rest value. Interactive tokens carry only their
 * rest value here; their `hover`/`pressed` states live in `SemanticColors`.
 */
export type SemanticColorTokenValues = {
  // surface / neutral
  surfaceNeutralFarther: ColorValue;
  surfaceNeutralFar: ColorValue;
  surfaceNeutralNear: ColorValue;
  surfaceNeutralNearer: ColorValue;
  surfaceNeutralTranslucent: ColorValue;

  // background / neutral
  backgroundNeutralHeavy: ColorValue;
  backgroundNeutralLoud: ColorValue;
  backgroundNeutralSoft: ColorValue;
  backgroundNeutralSubtle: ColorValue;
  backgroundNeutralTransparent: ColorValue;
  backgroundNeutralTranslucent: ColorValue;

  // background / brand
  backgroundBrandHeavy: ColorValue;
  backgroundBrandLoud: ColorValue;
  backgroundBrandSoft: ColorValue;
  backgroundBrandSubtle: ColorValue;
  backgroundBrandTransparent: ColorValue;

  // background / danger
  backgroundDangerLoud: ColorValue;
  backgroundDangerSoft: ColorValue;
  backgroundDangerSubtle: ColorValue;

  // background / warning
  backgroundWarningLoud: ColorValue;
  backgroundWarningSoft: ColorValue;
  backgroundWarningSubtle: ColorValue;

  // background / success
  backgroundSuccessLoud: ColorValue;
  backgroundSuccessSoft: ColorValue;
  backgroundSuccessSubtle: ColorValue;

  // stroke / neutral
  strokeNeutralHeavy: ColorValue;
  strokeNeutralLoud: ColorValue;
  strokeNeutralSoft: ColorValue;
  strokeNeutralSubtle: ColorValue;
  strokeNeutralTransparent: ColorValue;
  strokeNeutralOnloud: ColorValue;

  // stroke / brand
  strokeBrandLoud: ColorValue;
  strokeBrandSoft: ColorValue;
  strokeBrandSubtle: ColorValue;
  strokeBrandOnloud: ColorValue;

  // stroke / danger
  strokeDangerLoud: ColorValue;
  strokeDangerSoft: ColorValue;
  strokeDangerSubtle: ColorValue;
  strokeDangerOnloud: ColorValue;

  // stroke / warning
  strokeWarningLoud: ColorValue;
  strokeWarningSoft: ColorValue;
  strokeWarningSubtle: ColorValue;
  strokeWarningOnloud: ColorValue;

  // stroke / success
  strokeSuccessLoud: ColorValue;
  strokeSuccessSoft: ColorValue;
  strokeSuccessSubtle: ColorValue;
  strokeSuccessOnloud: ColorValue;

  // foreground / neutral
  foregroundNeutralPrimary: ColorValue;
  foregroundNeutralSecondary: ColorValue;
  foregroundNeutralTertiary: ColorValue;
  foregroundNeutralOnloud: ColorValue;

  // foreground / brand
  foregroundBrandPrimary: ColorValue;
  foregroundBrandOnloud: ColorValue;

  // foreground / danger
  foregroundDangerPrimary: ColorValue;
  foregroundDangerOnloud: ColorValue;

  // foreground / warning
  foregroundWarningPrimary: ColorValue;
  foregroundWarningOnloud: ColorValue;

  // foreground / success
  foregroundSuccessPrimary: ColorValue;
  foregroundSuccessOnloud: ColorValue;

  // fixed
  fixedWhite: ColorValue;
  fixedBlack: ColorValue;

  // expression / accent
  expressionAccentHeavy: ColorValue;
  expressionAccentLoud: ColorValue;
  expressionAccentSoft: ColorValue;
  expressionAccentSubtle: ColorValue;

  // expression / achromatic
  expressionAchromaticHeavy: ColorValue;
  expressionAchromaticSubtle: ColorValue;

  // expression / gray
  expressionGrayHeavy: ColorValue;
  expressionGrayLoud: ColorValue;
  expressionGraySoft: ColorValue;
  expressionGraySubtle: ColorValue;

  // expression / navy
  expressionNavyHeavy: ColorValue;
  expressionNavyLoud: ColorValue;
  expressionNavySoft: ColorValue;
  expressionNavySubtle: ColorValue;

  // expression / blue
  expressionBlueHeavy: ColorValue;
  expressionBlueLoud: ColorValue;
  expressionBlueSoft: ColorValue;
  expressionBlueSubtle: ColorValue;

  // expression / green
  expressionGreenHeavy: ColorValue;
  expressionGreenLoud: ColorValue;
  expressionGreenSoft: ColorValue;
  expressionGreenSubtle: ColorValue;

  // expression / lime
  expressionLimeHeavy: ColorValue;
  expressionLimeLoud: ColorValue;
  expressionLimeSoft: ColorValue;
  expressionLimeSubtle: ColorValue;

  // expression / yellow
  expressionYellowHeavy: ColorValue;
  expressionYellowLoud: ColorValue;
  expressionYellowSoft: ColorValue;
  expressionYellowSubtle: ColorValue;

  // expression / pumpkin
  expressionPumpkinHeavy: ColorValue;
  expressionPumpkinLoud: ColorValue;
  expressionPumpkinSoft: ColorValue;
  expressionPumpkinSubtle: ColorValue;

  // expression / red
  expressionRedHeavy: ColorValue;
  expressionRedLoud: ColorValue;
  expressionRedSoft: ColorValue;
  expressionRedSubtle: ColorValue;

  // expression / pink
  expressionPinkHeavy: ColorValue;
  expressionPinkLoud: ColorValue;
  expressionPinkSoft: ColorValue;
  expressionPinkSubtle: ColorValue;

  // expression / purple
  expressionPurpleHeavy: ColorValue;
  expressionPurpleLoud: ColorValue;
  expressionPurpleSoft: ColorValue;
  expressionPurpleSubtle: ColorValue;

  // overlay
  overlayNeutralTranslucent: ColorValue;

  // material / background
  materialBackgroundThick: ColorValue;
  materialBackgroundRegular: ColorValue;
  materialBackgroundThin: ColorValue;

  // disabled
  backgroundNeutralDisabled: ColorValue;
  backgroundNeutralHeavyDisabled: ColorValue;
  backgroundNeutralSubtleDisabled: ColorValue;
  strokeNeutralDisabled: ColorValue;
  foregroundNeutralDisabled: ColorValue;

  // focus strokes
  strokeFocusInner: ColorValue;
  strokeFocusOuter: ColorValue;

  // shadow
  shadow: ColorValue;
};

/**
 * The subset of `SemanticColorTokenValues` that has interaction states. Used to
 * shape the `hover` and `pressed` override maps on `SemanticColors`.
 *
 * Source of truth: `dev/web/flex-themes/css/interaction-fallback.css`.
 */
export type InteractiveColorOverrides = Partial<
  Pick<
    SemanticColorTokenValues,
    | 'surfaceNeutralFarther'
    | 'surfaceNeutralFar'
    | 'surfaceNeutralNear'
    | 'surfaceNeutralNearer'
    | 'surfaceNeutralTranslucent'
    | 'backgroundNeutralHeavy'
    | 'backgroundNeutralLoud'
    | 'backgroundNeutralSoft'
    | 'backgroundNeutralSubtle'
    | 'backgroundNeutralTransparent'
    | 'backgroundNeutralTranslucent'
    | 'backgroundBrandHeavy'
    | 'backgroundBrandLoud'
    | 'backgroundBrandSoft'
    | 'backgroundBrandSubtle'
    | 'backgroundBrandTransparent'
    | 'backgroundDangerLoud'
    | 'backgroundDangerSoft'
    | 'backgroundDangerSubtle'
    | 'backgroundWarningLoud'
    | 'backgroundWarningSoft'
    | 'backgroundWarningSubtle'
    | 'backgroundSuccessLoud'
    | 'backgroundSuccessSoft'
    | 'backgroundSuccessSubtle'
    | 'strokeNeutralHeavy'
    | 'strokeNeutralLoud'
    | 'strokeNeutralSoft'
    | 'strokeNeutralSubtle'
    | 'strokeNeutralTransparent'
    | 'strokeNeutralOnloud'
    | 'strokeBrandLoud'
    | 'strokeBrandSoft'
    | 'strokeBrandSubtle'
    | 'strokeBrandOnloud'
    | 'strokeDangerLoud'
    | 'strokeDangerSoft'
    | 'strokeDangerSubtle'
    | 'strokeDangerOnloud'
    | 'strokeWarningLoud'
    | 'strokeWarningSoft'
    | 'strokeWarningSubtle'
    | 'strokeWarningOnloud'
    | 'strokeSuccessLoud'
    | 'strokeSuccessSoft'
    | 'strokeSuccessSubtle'
    | 'strokeSuccessOnloud'
    | 'foregroundNeutralPrimary'
    | 'foregroundNeutralSecondary'
    | 'foregroundNeutralTertiary'
    | 'foregroundNeutralOnloud'
    | 'foregroundBrandPrimary'
    | 'foregroundBrandOnloud'
    | 'foregroundDangerPrimary'
    | 'foregroundDangerOnloud'
    | 'foregroundWarningPrimary'
    | 'foregroundWarningOnloud'
    | 'foregroundSuccessPrimary'
    | 'foregroundSuccessOnloud'
  >
>;

/**
 * The full semantic color token set: every token's rest value, plus `hover` and
 * `pressed` maps that override only the interactive tokens.
 */
export type SemanticColors = SemanticColorTokenValues & {
  hover: InteractiveColorOverrides;
  pressed: InteractiveColorOverrides;
};

/**
 * The semantic shadow token set
 */
export type SemanticShadows = {
  lowest: ShadowToken;
  lower: ShadowToken;
  low: ShadowToken;
  high: ShadowToken;
  higher: ShadowToken;
  highest: ShadowToken;
};

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
};

export type SemanticTokens = FlexTokens;

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
