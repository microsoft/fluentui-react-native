import type { ColorValue, TextStyle, ViewStyle, DimensionValue } from 'react-native';
import type { ShadowToken } from '../theming/types/Shadow.types';

type FontWeight = TextStyle['fontWeight'];
type FontSize = TextStyle['fontSize'];
type BorderRadius = ViewStyle['borderRadius'];
type StrokeWidth = ViewStyle['borderWidth'];

/**
 * Flat map of every semantic color token to its rest value. Keys are the
 * camelCased `--gnrc-*` names, each prefixed with `color` so the color tokens
 * can be merged into a single flat token object alongside future non-color
 * tokens (spacing, radius, etc.). Interactive tokens carry only their rest
 * value here; their `hover`/`pressed` states live in `SemanticColors`.
 */
export type SemanticColorTokenValues = {
  // surface / neutral
  colorSurfaceNeutralFarther: ColorValue;
  colorSurfaceNeutralFar: ColorValue;
  colorSurfaceNeutralNear: ColorValue;
  colorSurfaceNeutralNearer: ColorValue;
  colorSurfaceNeutralTranslucent: ColorValue;

  // background / neutral
  colorBackgroundNeutralHeavy: ColorValue;
  colorBackgroundNeutralLoud: ColorValue;
  colorBackgroundNeutralSoft: ColorValue;
  colorBackgroundNeutralSubtle: ColorValue;
  colorBackgroundNeutralTransparent: ColorValue;
  colorBackgroundNeutralTranslucent: ColorValue;

  // background / brand
  colorBackgroundBrandHeavy: ColorValue;
  colorBackgroundBrandLoud: ColorValue;
  colorBackgroundBrandSoft: ColorValue;
  colorBackgroundBrandSubtle: ColorValue;
  colorBackgroundBrandTransparent: ColorValue;

  // background / danger
  colorBackgroundDangerLoud: ColorValue;
  colorBackgroundDangerSoft: ColorValue;
  colorBackgroundDangerSubtle: ColorValue;

  // background / warning
  colorBackgroundWarningLoud: ColorValue;
  colorBackgroundWarningSoft: ColorValue;
  colorBackgroundWarningSubtle: ColorValue;

  // background / success
  colorBackgroundSuccessLoud: ColorValue;
  colorBackgroundSuccessSoft: ColorValue;
  colorBackgroundSuccessSubtle: ColorValue;

  // stroke / neutral
  colorStrokeNeutralHeavy: ColorValue;
  colorStrokeNeutralLoud: ColorValue;
  colorStrokeNeutralSoft: ColorValue;
  colorStrokeNeutralSubtle: ColorValue;
  colorStrokeNeutralTransparent: ColorValue;
  colorStrokeNeutralOnloud: ColorValue;

  // stroke / brand
  colorStrokeBrandLoud: ColorValue;
  colorStrokeBrandSoft: ColorValue;
  colorStrokeBrandSubtle: ColorValue;
  colorStrokeBrandOnloud: ColorValue;

  // stroke / danger
  colorStrokeDangerLoud: ColorValue;
  colorStrokeDangerSoft: ColorValue;
  colorStrokeDangerSubtle: ColorValue;
  colorStrokeDangerOnloud: ColorValue;

  // stroke / warning
  colorStrokeWarningLoud: ColorValue;
  colorStrokeWarningSoft: ColorValue;
  colorStrokeWarningSubtle: ColorValue;
  colorStrokeWarningOnloud: ColorValue;

  // stroke / success
  colorStrokeSuccessLoud: ColorValue;
  colorStrokeSuccessSoft: ColorValue;
  colorStrokeSuccessSubtle: ColorValue;
  colorStrokeSuccessOnloud: ColorValue;

  // foreground / neutral
  colorForegroundNeutralPrimary: ColorValue;
  colorForegroundNeutralSecondary: ColorValue;
  colorForegroundNeutralTertiary: ColorValue;
  colorForegroundNeutralOnloud: ColorValue;

  // foreground / brand
  colorForegroundBrandPrimary: ColorValue;
  colorForegroundBrandOnloud: ColorValue;

  // foreground / danger
  colorForegroundDangerPrimary: ColorValue;
  colorForegroundDangerOnloud: ColorValue;

  // foreground / warning
  colorForegroundWarningPrimary: ColorValue;
  colorForegroundWarningOnloud: ColorValue;

  // foreground / success
  colorForegroundSuccessPrimary: ColorValue;
  colorForegroundSuccessOnloud: ColorValue;

  // fixed
  colorFixedWhite: ColorValue;
  colorFixedBlack: ColorValue;

  // expression / accent
  colorExpressionAccentHeavy: ColorValue;
  colorExpressionAccentLoud: ColorValue;
  colorExpressionAccentSoft: ColorValue;
  colorExpressionAccentSubtle: ColorValue;

  // expression / achromatic
  colorExpressionAchromaticHeavy: ColorValue;
  colorExpressionAchromaticSubtle: ColorValue;

  // expression / gray
  colorExpressionGrayHeavy: ColorValue;
  colorExpressionGrayLoud: ColorValue;
  colorExpressionGraySoft: ColorValue;
  colorExpressionGraySubtle: ColorValue;

  // expression / navy
  colorExpressionNavyHeavy: ColorValue;
  colorExpressionNavyLoud: ColorValue;
  colorExpressionNavySoft: ColorValue;
  colorExpressionNavySubtle: ColorValue;

  // expression / blue
  colorExpressionBlueHeavy: ColorValue;
  colorExpressionBlueLoud: ColorValue;
  colorExpressionBlueSoft: ColorValue;
  colorExpressionBlueSubtle: ColorValue;

  // expression / green
  colorExpressionGreenHeavy: ColorValue;
  colorExpressionGreenLoud: ColorValue;
  colorExpressionGreenSoft: ColorValue;
  colorExpressionGreenSubtle: ColorValue;

  // expression / lime
  colorExpressionLimeHeavy: ColorValue;
  colorExpressionLimeLoud: ColorValue;
  colorExpressionLimeSoft: ColorValue;
  colorExpressionLimeSubtle: ColorValue;

  // expression / yellow
  colorExpressionYellowHeavy: ColorValue;
  colorExpressionYellowLoud: ColorValue;
  colorExpressionYellowSoft: ColorValue;
  colorExpressionYellowSubtle: ColorValue;

  // expression / pumpkin
  colorExpressionPumpkinHeavy: ColorValue;
  colorExpressionPumpkinLoud: ColorValue;
  colorExpressionPumpkinSoft: ColorValue;
  colorExpressionPumpkinSubtle: ColorValue;

  // expression / red
  colorExpressionRedHeavy: ColorValue;
  colorExpressionRedLoud: ColorValue;
  colorExpressionRedSoft: ColorValue;
  colorExpressionRedSubtle: ColorValue;

  // expression / pink
  colorExpressionPinkHeavy: ColorValue;
  colorExpressionPinkLoud: ColorValue;
  colorExpressionPinkSoft: ColorValue;
  colorExpressionPinkSubtle: ColorValue;

  // expression / purple
  colorExpressionPurpleHeavy: ColorValue;
  colorExpressionPurpleLoud: ColorValue;
  colorExpressionPurpleSoft: ColorValue;
  colorExpressionPurpleSubtle: ColorValue;

  // overlay
  colorOverlayNeutralTranslucent: ColorValue;

  // material / background
  colorMaterialBackgroundThick: ColorValue;
  colorMaterialBackgroundRegular: ColorValue;
  colorMaterialBackgroundThin: ColorValue;

  // disabled
  colorBackgroundNeutralDisabled: ColorValue;
  colorBackgroundNeutralHeavyDisabled: ColorValue;
  colorBackgroundNeutralSubtleDisabled: ColorValue;
  colorStrokeNeutralDisabled: ColorValue;
  colorForegroundNeutralDisabled: ColorValue;

  // focus strokes
  colorStrokeFocusInner: ColorValue;
  colorStrokeFocusOuter: ColorValue;

  // shadow
  colorShadow: ColorValue;
};

/**
 * The subset of `SemanticColorTokenValues` that has interaction states. Used to
 * shape the `hover` and `pressed` override maps on `SemanticColors`.
 *
 * Source of truth: `dev/web/flex-themes/css/interaction-fallback.css`.
 */
export type InteractiveColorOverrides = Pick<
  SemanticColorTokenValues,
  | 'colorSurfaceNeutralFarther'
  | 'colorSurfaceNeutralFar'
  | 'colorSurfaceNeutralNear'
  | 'colorSurfaceNeutralNearer'
  | 'colorSurfaceNeutralTranslucent'
  | 'colorBackgroundNeutralHeavy'
  | 'colorBackgroundNeutralLoud'
  | 'colorBackgroundNeutralSoft'
  | 'colorBackgroundNeutralSubtle'
  | 'colorBackgroundNeutralTransparent'
  | 'colorBackgroundNeutralTranslucent'
  | 'colorBackgroundBrandHeavy'
  | 'colorBackgroundBrandLoud'
  | 'colorBackgroundBrandSoft'
  | 'colorBackgroundBrandSubtle'
  | 'colorBackgroundBrandTransparent'
  | 'colorBackgroundDangerLoud'
  | 'colorBackgroundDangerSoft'
  | 'colorBackgroundDangerSubtle'
  | 'colorBackgroundWarningLoud'
  | 'colorBackgroundWarningSoft'
  | 'colorBackgroundWarningSubtle'
  | 'colorBackgroundSuccessLoud'
  | 'colorBackgroundSuccessSoft'
  | 'colorBackgroundSuccessSubtle'
  | 'colorStrokeNeutralHeavy'
  | 'colorStrokeNeutralLoud'
  | 'colorStrokeNeutralSoft'
  | 'colorStrokeNeutralSubtle'
  | 'colorStrokeNeutralTransparent'
  | 'colorStrokeNeutralOnloud'
  | 'colorStrokeBrandLoud'
  | 'colorStrokeBrandSoft'
  | 'colorStrokeBrandSubtle'
  | 'colorStrokeBrandOnloud'
  | 'colorStrokeDangerLoud'
  | 'colorStrokeDangerSoft'
  | 'colorStrokeDangerSubtle'
  | 'colorStrokeDangerOnloud'
  | 'colorStrokeWarningLoud'
  | 'colorStrokeWarningSoft'
  | 'colorStrokeWarningSubtle'
  | 'colorStrokeWarningOnloud'
  | 'colorStrokeSuccessLoud'
  | 'colorStrokeSuccessSoft'
  | 'colorStrokeSuccessSubtle'
  | 'colorStrokeSuccessOnloud'
  | 'colorForegroundNeutralPrimary'
  | 'colorForegroundNeutralSecondary'
  | 'colorForegroundNeutralTertiary'
  | 'colorForegroundNeutralOnloud'
  | 'colorForegroundBrandPrimary'
  | 'colorForegroundBrandOnloud'
  | 'colorForegroundDangerPrimary'
  | 'colorForegroundDangerOnloud'
  | 'colorForegroundWarningPrimary'
  | 'colorForegroundWarningOnloud'
  | 'colorForegroundSuccessPrimary'
  | 'colorForegroundSuccessOnloud'
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
 * The complete semantic token set: all `SemanticColors` plus the non-color
 * semantic tokens (shadows, font weights/families, letter spacing, font sizes,
 * line heights, border radii, spacing, and stroke widths). Keys are the
 * camelCased `--gnrc-*` names.
 *
 * Source of truth: `dev/web/flex-themes/css/semantic.css`.
 */
export type SemanticTokens = SemanticColors & {
  // shadow
  shadowLowest: ShadowToken;
  shadowLower: ShadowToken;
  shadowLow: ShadowToken;
  shadowHigh: ShadowToken;
  shadowHigher: ShadowToken;
  shadowHighest: ShadowToken;

  // font weight
  fontWeightFunctionalRegular: FontWeight;
  fontWeightFunctionalMedium: FontWeight;
  fontWeightFunctionalSemibold: FontWeight;
  fontWeightFunctionalBold: FontWeight;
  fontWeightContentRegular: FontWeight;
  fontWeightContentMedium: FontWeight;
  fontWeightContentSemibold: FontWeight;
  fontWeightContentBold: FontWeight;
  fontWeightContentEditorialRegular: FontWeight;
  fontWeightContentEditorialMedium: FontWeight;
  fontWeightContentEditorialSemibold: FontWeight;
  fontWeightContentEditorialBold: FontWeight;

  // font family
  fontFamilyFunctional: string;
  fontFamilyContent: string;
  fontFamilyContentEditorial: string;
  fontFamilyContentCode: string;

  // font size
  fontSizeFunctionalDisplay: FontSize;
  fontSizeFunctionalPagetitle: FontSize;
  fontSizeFunctionalTitleLarge: FontSize;
  fontSizeFunctionalTitleMedium: FontSize;
  fontSizeFunctionalTitleSmall: FontSize;
  fontSizeFunctionalSubtitle: FontSize;
  fontSizeFunctionalBodyLarge: FontSize;
  fontSizeFunctionalBodyMedium: FontSize;
  fontSizeFunctionalBodySmall: FontSize;
  fontSizeFunctionalCaption: FontSize;
  fontSizeContentStatement: FontSize;
  fontSizeContentExpressiveLarge: FontSize;
  fontSizeContentExpressiveMedium: FontSize;
  fontSizeContentExpressiveSmall: FontSize;
  fontSizeContentH1: FontSize;
  fontSizeContentH2: FontSize;
  fontSizeContentH3: FontSize;
  fontSizeContentH4: FontSize;
  fontSizeContentH5: FontSize;
  fontSizeContentSubheadline: FontSize;
  fontSizeContentParagraphLarge: FontSize;
  fontSizeContentParagraphMedium: FontSize;
  fontSizeContentParagraphSmall: FontSize;
  fontSizeContentSubtext: FontSize;
  fontSizeContentTable: FontSize;
  fontSizeContentCode: FontSize;

  // line height
  lineHeightFunctionalDisplay: number;
  lineHeightFunctionalPagetitle: number;
  lineHeightFunctionalTitleLarge: number;
  lineHeightFunctionalTitleMedium: number;
  lineHeightFunctionalTitleSmall: number;
  lineHeightFunctionalSubtitle: number;
  lineHeightFunctionalBodyLarge: number;
  lineHeightFunctionalBodyMedium: number;
  lineHeightFunctionalBodySmall: number;
  lineHeightFunctionalCaption: number;
  lineHeightContentStatement: number;
  lineHeightContentExpressiveLarge: number;
  lineHeightContentExpressiveMedium: number;
  lineHeightContentExpressiveSmall: number;
  lineHeightContentH1: number;
  lineHeightContentH2: number;
  lineHeightContentH3: number;
  lineHeightContentH4: number;
  lineHeightContentH5: number;
  lineHeightContentSubheadline: number;
  lineHeightContentParagraphLarge: number;
  lineHeightContentParagraphMedium: number;
  lineHeightContentParagraphSmall: number;
  lineHeightContentSubtext: number;
  lineHeightContentTable: number;
  lineHeightContentCode: number;

  // border radius
  borderRadiusBase100: BorderRadius;
  borderRadiusBase200: BorderRadius;
  borderRadiusBase300: BorderRadius;
  borderRadiusBase400: BorderRadius;
  borderRadiusBase600: BorderRadius;
  borderRadiusBase700: BorderRadius;
  borderRadiusCircular: BorderRadius;

  // spacing / component
  spacingComponentBase50: DimensionValue;
  spacingComponentBase100: DimensionValue;
  spacingComponentBase150: DimensionValue;
  spacingComponentBase200: DimensionValue;
  spacingComponentBase250: DimensionValue;
  spacingComponentBase300: DimensionValue;
  spacingComponentBase400: DimensionValue;
  spacingComponentBase500: DimensionValue;
  spacingComponentBase600: DimensionValue;
  spacingComponentBase700: DimensionValue;

  // spacing / layout
  spacingLayoutBase100: DimensionValue;
  spacingLayoutBase200: DimensionValue;
  spacingLayoutBase300: DimensionValue;
  spacingLayoutBase400: DimensionValue;
  spacingLayoutBase450: DimensionValue;
  spacingLayoutBase500: DimensionValue;
  spacingLayoutBase600: DimensionValue;
  spacingLayoutBase700: DimensionValue;
  spacingLayoutBase800: DimensionValue;
  spacingLayoutBase1000: DimensionValue;
  spacingLayoutBase1200: DimensionValue;

  // stroke width
  strokeWidthThin: StrokeWidth;
  strokeWidthThick: StrokeWidth;
  strokeWidthThicker: StrokeWidth;
  strokeWidthThickest: StrokeWidth;
};

/**
 * These are flex tokens from web that are not supported on native.
 */
export type UnsupportedFlexTokens = {
  // letter spacing
  letterSpacingFunctionalDisplay: string;
  letterSpacingFunctionalPagetitle: string;
  letterSpacingFunctionalTitleLarge: string;
  letterSpacingFunctionalTitleMedium: string;
  letterSpacingFunctionalTitleSmall: string;
  letterSpacingFunctionalSubtitle: string;
  letterSpacingFunctionalBodyLarge: string;
  letterSpacingFunctionalBodyMedium: string;
  letterSpacingFunctionalBodySmall: string;
  letterSpacingFunctionalCaption: string;
  letterSpacingContentStatement: string;
  letterSpacingContentExpressiveLarge: string;
  letterSpacingContentExpressiveMedium: string;
  letterSpacingContentExpressiveSmall: string;
  letterSpacingContentH1: string;
  letterSpacingContentH2: string;
  letterSpacingContentH3: string;
  letterSpacingContentH4: string;
  letterSpacingContentH5: string;
  letterSpacingContentSubheadline: string;
  letterSpacingContentParagraphLarge: string;
  letterSpacingContentParagraphMedium: string;
  letterSpacingContentParagraphSmall: string;
  letterSpacingContentSubtext: string;
  letterSpacingContentTable: string;
  letterSpacingContentCode: string;
};
