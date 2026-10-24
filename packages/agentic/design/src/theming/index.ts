export type {
  AliasColorTokens,
  Color,
  FabricWebPalette,
  Palette,
  PaletteBackgroundColors,
  PaletteTextColors,
  PartialPalette,
  ThemeColorDefinition,
} from '../fluent/types/Color.types';
export type {
  ShadowValue,
  ShadowToken,
  BaseShadowAliasTokens,
  ThemeShadowDefinition,
  PartialShadowDefinition,
} from '../fluent/types/Shadow.types';
export type { AppearanceOptions, PartialTheme, Spacing, Theme, ThemeOptions } from '../fluent/types/Theme.types';
export type {
  ColorTone,
  NormalizedThemeAppearance,
  ResolvedThemeAppearance,
  ThemeAppearanceOptions,
  ThemeAppearanceRequest,
  ThemeAppearanceSource,
  ThemeAppearanceSourceSnapshot,
  ThemeAppearanceStore,
  ThemeAppearanceState,
  ThemeColorScheme,
  ThemeContrast,
  ThemeInterfaceLevel,
} from '../types/appearance.types';
export {
  appearanceOptionFromResolved,
  appearanceOptionsFromLegacy,
  normalizeThemeAppearanceRequest,
  resolveThemeAppearance,
  themeAppearanceKey,
} from './appearance';
export { createThemeAppearanceSource } from './appearanceSource';
export type {
  FontDynamicTypeRamp,
  FontFamilies,
  FontFamily,
  FontFamilyValue,
  FontSize,
  FontSizeValuePoints,
  FontSizes,
  FontWeight,
  FontWeightValue,
  FontWeights,
  PartialTypography,
  TextStyling,
  Typography,
  Variant,
  VariantValue,
  Variants,
} from '../fluent/types/Typography.types';
export { ThemeContext } from './context';
export { useTheme } from '../fluent/useTheme';
export type { OfficePalette } from '../fluent/types/palette.types';
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { ThemedRoot } from './ThemedRoot';
export type { ThemedRootProps } from './ThemedRoot';
export { RootContext, useRootSettings } from './rootContext';
export { RootInputBoundary } from './RootInputBoundary';
export { useRootInputModality } from './useRootInputModality';
export type { InputModality, RootSettings } from './rootContext';
export { FlexThemeReference } from '../flex/flexThemeReference';
export type {
  FlexThemeInput,
  FlexThemeRecipe,
  FlexThemeReferenceOptions,
  LegacyThemeFallback,
  PartialFlexTokens,
} from '../flex/flexThemeReference';
export { ThemeReference } from '../fluent/themeReference';
export type { OnThemeChange, ThemeRecipe, ThemeReferenceOptions, ThemeTransform } from '../fluent/themeReference';
export type { FlexThemeSource, LegacyThemeSource, ThemeSource, ThemeSourceBase } from './themeSource';
export { getCurrentAppearance, isHighContrast, setIsHighContrast } from '../fluent/platformUtils';
export { mapFontPipelineToTheme, mapPipelineToTheme } from '../fluent/mapPipelineToTheme';
export { mapPipelineToShadow } from '../fluent/mapPipelineToShadow';
