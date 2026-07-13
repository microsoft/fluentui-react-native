/**
 * Flat map of every semantic color token to its rest value. Keys are the
 * camelCased `--gnrc-*` names, each prefixed with `color` so the color tokens
 * can be merged into a single flat token object alongside future non-color
 * tokens (spacing, radius, etc.). Interactive tokens carry only their rest
 * value here; their `hover`/`pressed` states live in `SemanticColors`.
 */
export type SemanticColorTokenValues = {
  // surface / neutral
  colorSurfaceNeutralFarther: string;
  colorSurfaceNeutralFar: string;
  colorSurfaceNeutralNear: string;
  colorSurfaceNeutralNearer: string;
  colorSurfaceNeutralTranslucent: string;

  // background / neutral
  colorBackgroundNeutralHeavy: string;
  colorBackgroundNeutralLoud: string;
  colorBackgroundNeutralSoft: string;
  colorBackgroundNeutralSubtle: string;
  colorBackgroundNeutralTransparent: string;
  colorBackgroundNeutralTranslucent: string;

  // background / brand
  colorBackgroundBrandHeavy: string;
  colorBackgroundBrandLoud: string;
  colorBackgroundBrandSoft: string;
  colorBackgroundBrandSubtle: string;
  colorBackgroundBrandTransparent: string;

  // background / danger
  colorBackgroundDangerLoud: string;
  colorBackgroundDangerSoft: string;
  colorBackgroundDangerSubtle: string;

  // background / warning
  colorBackgroundWarningLoud: string;
  colorBackgroundWarningSoft: string;
  colorBackgroundWarningSubtle: string;

  // background / success
  colorBackgroundSuccessLoud: string;
  colorBackgroundSuccessSoft: string;
  colorBackgroundSuccessSubtle: string;

  // stroke / neutral
  colorStrokeNeutralHeavy: string;
  colorStrokeNeutralLoud: string;
  colorStrokeNeutralSoft: string;
  colorStrokeNeutralSubtle: string;
  colorStrokeNeutralTransparent: string;
  colorStrokeNeutralOnloud: string;

  // stroke / brand
  colorStrokeBrandLoud: string;
  colorStrokeBrandSoft: string;
  colorStrokeBrandSubtle: string;
  colorStrokeBrandOnloud: string;

  // stroke / danger
  colorStrokeDangerLoud: string;
  colorStrokeDangerSoft: string;
  colorStrokeDangerSubtle: string;
  colorStrokeDangerOnloud: string;

  // stroke / warning
  colorStrokeWarningLoud: string;
  colorStrokeWarningSoft: string;
  colorStrokeWarningSubtle: string;
  colorStrokeWarningOnloud: string;

  // stroke / success
  colorStrokeSuccessLoud: string;
  colorStrokeSuccessSoft: string;
  colorStrokeSuccessSubtle: string;
  colorStrokeSuccessOnloud: string;

  // foreground / neutral
  colorForegroundNeutralPrimary: string;
  colorForegroundNeutralSecondary: string;
  colorForegroundNeutralTertiary: string;
  colorForegroundNeutralOnloud: string;

  // foreground / brand
  colorForegroundBrandPrimary: string;
  colorForegroundBrandOnloud: string;

  // foreground / danger
  colorForegroundDangerPrimary: string;
  colorForegroundDangerOnloud: string;

  // foreground / warning
  colorForegroundWarningPrimary: string;
  colorForegroundWarningOnloud: string;

  // foreground / success
  colorForegroundSuccessPrimary: string;
  colorForegroundSuccessOnloud: string;

  // fixed
  colorFixedWhite: string;
  colorFixedBlack: string;

  // expression / accent
  colorExpressionAccentHeavy: string;
  colorExpressionAccentLoud: string;
  colorExpressionAccentSoft: string;
  colorExpressionAccentSubtle: string;

  // expression / achromatic
  colorExpressionAchromaticHeavy: string;
  colorExpressionAchromaticSubtle: string;

  // expression / gray
  colorExpressionGrayHeavy: string;
  colorExpressionGrayLoud: string;
  colorExpressionGraySoft: string;
  colorExpressionGraySubtle: string;

  // expression / navy
  colorExpressionNavyHeavy: string;
  colorExpressionNavyLoud: string;
  colorExpressionNavySoft: string;
  colorExpressionNavySubtle: string;

  // expression / blue
  colorExpressionBlueHeavy: string;
  colorExpressionBlueLoud: string;
  colorExpressionBlueSoft: string;
  colorExpressionBlueSubtle: string;

  // expression / green
  colorExpressionGreenHeavy: string;
  colorExpressionGreenLoud: string;
  colorExpressionGreenSoft: string;
  colorExpressionGreenSubtle: string;

  // expression / lime
  colorExpressionLimeHeavy: string;
  colorExpressionLimeLoud: string;
  colorExpressionLimeSoft: string;
  colorExpressionLimeSubtle: string;

  // expression / yellow
  colorExpressionYellowHeavy: string;
  colorExpressionYellowLoud: string;
  colorExpressionYellowSoft: string;
  colorExpressionYellowSubtle: string;

  // expression / pumpkin
  colorExpressionPumpkinHeavy: string;
  colorExpressionPumpkinLoud: string;
  colorExpressionPumpkinSoft: string;
  colorExpressionPumpkinSubtle: string;

  // expression / red
  colorExpressionRedHeavy: string;
  colorExpressionRedLoud: string;
  colorExpressionRedSoft: string;
  colorExpressionRedSubtle: string;

  // expression / pink
  colorExpressionPinkHeavy: string;
  colorExpressionPinkLoud: string;
  colorExpressionPinkSoft: string;
  colorExpressionPinkSubtle: string;

  // expression / purple
  colorExpressionPurpleHeavy: string;
  colorExpressionPurpleLoud: string;
  colorExpressionPurpleSoft: string;
  colorExpressionPurpleSubtle: string;

  // overlay
  colorOverlayNeutralTranslucent: string;

  // material / background
  colorMaterialBackgroundThick: string;
  colorMaterialBackgroundRegular: string;
  colorMaterialBackgroundThin: string;

  // disabled
  colorBackgroundNeutralDisabled: string;
  colorBackgroundNeutralHeavyDisabled: string;
  colorBackgroundNeutralSubtleDisabled: string;
  colorStrokeNeutralDisabled: string;
  colorForegroundNeutralDisabled: string;

  // focus strokes
  colorStrokeFocusInner: string;
  colorStrokeFocusOuter: string;

  // shadow
  colorShadow: string;
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
  shadowLowest: string;
  shadowLower: string;
  shadowLow: string;
  shadowHigh: string;
  shadowHigher: string;
  shadowHighest: string;

  // font weight
  fontWeightFunctionalRegular: number;
  fontWeightFunctionalMedium: number;
  fontWeightFunctionalSemibold: number;
  fontWeightFunctionalBold: number;
  fontWeightContentRegular: number;
  fontWeightContentMedium: number;
  fontWeightContentSemibold: number;
  fontWeightContentBold: number;
  fontWeightContentEditorialRegular: number;
  fontWeightContentEditorialMedium: number;
  fontWeightContentEditorialSemibold: number;
  fontWeightContentEditorialBold: number;

  // font family
  fontFamilyFunctional: string;
  fontFamilyContent: string;
  fontFamilyContentEditorial: string;
  fontFamilyContentCode: string;

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

  // font size
  fontSizeFunctionalDisplay: string;
  fontSizeFunctionalPagetitle: string;
  fontSizeFunctionalTitleLarge: string;
  fontSizeFunctionalTitleMedium: string;
  fontSizeFunctionalTitleSmall: string;
  fontSizeFunctionalSubtitle: string;
  fontSizeFunctionalBodyLarge: string;
  fontSizeFunctionalBodyMedium: string;
  fontSizeFunctionalBodySmall: string;
  fontSizeFunctionalCaption: string;
  fontSizeContentStatement: string;
  fontSizeContentExpressiveLarge: string;
  fontSizeContentExpressiveMedium: string;
  fontSizeContentExpressiveSmall: string;
  fontSizeContentH1: string;
  fontSizeContentH2: string;
  fontSizeContentH3: string;
  fontSizeContentH4: string;
  fontSizeContentH5: string;
  fontSizeContentSubheadline: string;
  fontSizeContentParagraphLarge: string;
  fontSizeContentParagraphMedium: string;
  fontSizeContentParagraphSmall: string;
  fontSizeContentSubtext: string;
  fontSizeContentTable: string;
  fontSizeContentCode: string;

  // line height
  lineHeightFunctionalDisplay: string;
  lineHeightFunctionalPagetitle: string;
  lineHeightFunctionalTitleLarge: string;
  lineHeightFunctionalTitleMedium: string;
  lineHeightFunctionalTitleSmall: string;
  lineHeightFunctionalSubtitle: string;
  lineHeightFunctionalBodyLarge: string;
  lineHeightFunctionalBodyMedium: string;
  lineHeightFunctionalBodySmall: string;
  lineHeightFunctionalCaption: string;
  lineHeightContentStatement: string;
  lineHeightContentExpressiveLarge: string;
  lineHeightContentExpressiveMedium: string;
  lineHeightContentExpressiveSmall: string;
  lineHeightContentH1: string;
  lineHeightContentH2: string;
  lineHeightContentH3: string;
  lineHeightContentH4: string;
  lineHeightContentH5: string;
  lineHeightContentSubheadline: string;
  lineHeightContentParagraphLarge: string;
  lineHeightContentParagraphMedium: string;
  lineHeightContentParagraphSmall: string;
  lineHeightContentSubtext: string;
  lineHeightContentTable: string;
  lineHeightContentCode: string;

  // border radius
  borderRadiusBase100: string;
  borderRadiusBase200: string;
  borderRadiusBase300: string;
  borderRadiusBase400: string;
  borderRadiusBase600: string;
  borderRadiusBase700: string;
  borderRadiusCircular: string;

  // spacing / component
  spacingComponentBase50: string;
  spacingComponentBase100: string;
  spacingComponentBase150: string;
  spacingComponentBase200: string;
  spacingComponentBase250: string;
  spacingComponentBase300: string;
  spacingComponentBase400: string;
  spacingComponentBase500: string;
  spacingComponentBase600: string;
  spacingComponentBase700: string;

  // spacing / layout
  spacingLayoutBase100: string;
  spacingLayoutBase200: string;
  spacingLayoutBase300: string;
  spacingLayoutBase400: string;
  spacingLayoutBase450: string;
  spacingLayoutBase500: string;
  spacingLayoutBase600: string;
  spacingLayoutBase700: string;
  spacingLayoutBase800: string;
  spacingLayoutBase1000: string;
  spacingLayoutBase1200: string;

  // stroke width
  strokeWidthThin: string;
  strokeWidthThick: string;
  strokeWidthThicker: string;
  strokeWidthThickest: string;
};
