export type { FontSize, FontWeight } from './tokens/textAttributes';
export { fontSize, fontWeight } from './tokens/textAttributes';
export type {
  ColorEntry,
  ColorTuple,
  FlexColorDescription,
  FlexColorInput,
  FlexTokenDescription,
  FlexTokens,
  InteractiveColor,
  InteractiveColorOptions,
  InteractiveColorType,
  PartialSemanticColors,
  SemanticBorderRadii,
  SemanticColorDescriptions,
  SemanticColorName,
  SemanticColors,
  SemanticColorTokenValues,
  SemanticFontFamilies,
  SemanticFontSizes,
  SemanticFontWeights,
  SemanticLineHeights,
  SemanticShadows,
  SemanticSpacing,
  SemanticStrokeWidths,
  SemanticTokens,
  UnsupportedFlexTokens,
} from './flex/tokens.types';
export { INTERACTIVE_COLOR_TOKENS, isInteractiveColorToken, isInverseInteractionToken } from './flex/colors/interactiveTokens';
export { flexColor, selectColorEntry } from './flex/colors/flexColor';
export type { ColorSchemeSelector } from './flex/colors/flexColor';
export type { InteractiveColorToken } from './flex/colors/interactiveTokens';
export { flexTokensFromTheme } from './flex/adapters/flexTokensFromTheme';
export {
  createThemeAppearanceSource,
  FlexThemeReference,
  normalizeThemeAppearanceRequest,
  resolveThemeAppearance,
  RootContext,
  RootInputBoundary,
  ThemedRoot,
  ThemeProvider,
  useRootSettings,
  useRootInputModality,
} from './theming/modern';
export type {
  ColorTone,
  FlexThemeInput,
  FlexThemeRecipe,
  FlexThemeReferenceOptions,
  FlexThemeSource,
  InputModality,
  LegacyThemeFallback,
  LegacyThemeSource,
  NormalizedThemeAppearance,
  PartialFlexTokens,
  ResolvedThemeAppearance,
  RootSettings,
  ThemeAppearanceOptions,
  ThemeAppearanceRequest,
  ThemeAppearanceSource,
  ThemeAppearanceSourceSnapshot,
  ThemeAppearanceStore,
  ThemeAppearanceState,
  ThemeColorScheme,
  ThemeContrast,
  ThemeInterfaceLevel,
  ThemedRootProps,
  ThemeProviderProps,
  ThemeSource,
  ThemeSourceBase,
} from './theming/modern';
export type { ThemeStyleSheet } from './flex/useThemeState';
export type { ThemeState } from './types/themeState.types';
export { themedStyleSheetFactory, useThemeAppearance, useThemeState } from './flex/useThemeState';
