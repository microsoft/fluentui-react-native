export type {
  AliasColorTokens,
  Color,
  FabricWebPalette,
  Palette,
  PaletteBackgroundColors,
  PaletteTextColors,
  PartialPalette,
  ThemeColorDefinition,
} from './types/Color.types';
export type { ShadowValue, ShadowToken, BaseShadowAliasTokens, ThemeShadowDefinition, PartialShadowDefinition } from './types/Shadow.types';
export type { AppearanceOptions, PartialTheme, Spacing, Theme, ThemeOptions } from './types/Theme.types';
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
} from './types/Typography.types';
export { ThemeContext, useTheme } from './context';
export type { OfficePalette } from './types/palette.types';
export { ThemeProvider } from './ThemeProvider';
export type { ThemeProviderProps } from './ThemeProvider';
export { ThemeReference } from './themeReference';
export type { OnThemeChange, ThemeRecipe, ThemeTransform } from './themeReference';
export { getCurrentAppearance, isHighContrast, setIsHighContrast } from './platformUtils';
