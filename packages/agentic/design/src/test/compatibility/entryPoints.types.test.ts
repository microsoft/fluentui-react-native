import type { TextStyle } from 'react-native';

import { flexTokensFromTheme, useThemeState } from '../../index';
import type {
  FontSize as RootFontSize,
  FontWeight as RootFontWeight,
  ResolvedThemeAppearance as RootResolvedThemeAppearance,
  ThemeAppearanceOptions as RootThemeAppearanceOptions,
  ThemeState,
} from '../../index';
import { getDefaultLegacyTheme as getDefaultLegacyThemeOnly } from '../../theming/compat/defaultLegacyTheme';
import { getDefaultLegacyTheme, themeFromFlexTokens } from '../../theming/compat/index';
import type { ThemeFromFlexTokensOptions } from '../../theming/compat/index';
import {
  getCurrentAppearance,
  isHighContrast,
  mapFontPipelineToTheme,
  mapPipelineToShadow,
  mapPipelineToTheme,
  resolveThemeAppearance,
  setIsHighContrast,
  ThemeContext,
  ThemeProvider,
  ThemeReference,
  themeAppearanceKey,
  useTheme,
} from '../../theming/index';
import type {
  AliasColorTokens,
  AppearanceOptions,
  BaseShadowAliasTokens,
  Color,
  FabricWebPalette,
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
  OfficePalette,
  OnThemeChange,
  Palette,
  PaletteBackgroundColors,
  PaletteTextColors,
  PartialPalette,
  PartialShadowDefinition,
  PartialTheme,
  PartialTypography,
  ResolvedThemeAppearance,
  ShadowToken,
  ShadowValue,
  Spacing,
  TextStyling,
  Theme,
  ThemeColorDefinition,
  ThemeOptions,
  ThemeProviderProps,
  ThemeRecipe,
  ThemeShadowDefinition,
  ThemeTransform,
  Typography,
  Variant,
  Variants,
  VariantValue,
} from '../../theming/index';
import { ThemeReference as LegacySourceThemeReference } from '../../theming/legacySource';
import type { OnThemeChange as LegacySourceOnThemeChange, ThemeRecipe as LegacySourceThemeRecipe } from '../../theming/legacySource';
import { themedStyleSheet } from '../../styling/stylesheet/index';
import type { NamedStyles } from '../../styling/stylesheet/index';
import {
  backgroundColorTokens,
  borderStyles,
  borderTokens,
  colorTokens,
  fontStyles,
  foregroundColorTokens,
  getPaletteFromTheme,
  layoutStyles,
  layoutTokens,
  shadowStyles,
  shadowTokens,
  styleFunction,
  textTokens,
  tokenBuilder,
} from '../../styling/tokens/index';
import type {
  FontDecorationTokens,
  FontStyleTokens,
  FontTokens,
  FontVariantTokens,
  IBackgroundColorTokens,
  IBorderTokens,
  IColorTokens,
  IForegroundColorTokens,
  IShadowTokens,
  LayoutTokens,
  LookupThemePart,
  OperationSet,
  StyleFactoryFunction,
  StyleFactoryFunctionRaw,
  StyleFactoryOperation,
  TokenBuilder,
} from '../../styling/tokens/index';
import { getAliasTokens, getShadowTokens, globalTokens, hcAliasTokens } from '../../tokens/legacy/index';

/**
 * Every type name the compatibility packages re-export must remain importable
 * from its owning design entry point.
 */
export type LegacyThemeTypeInventory = [
  AliasColorTokens,
  AppearanceOptions,
  BaseShadowAliasTokens,
  Color,
  FabricWebPalette,
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
  OfficePalette,
  OnThemeChange,
  LegacySourceOnThemeChange,
  Palette,
  PaletteBackgroundColors,
  PaletteTextColors,
  PartialPalette,
  PartialShadowDefinition,
  PartialTheme,
  PartialTypography,
  ShadowToken,
  ShadowValue,
  Spacing,
  TextStyling,
  Theme,
  ThemeColorDefinition,
  ThemeOptions,
  ThemeProviderProps,
  ThemeRecipe<Theme, PartialTheme>,
  LegacySourceThemeRecipe<Theme, PartialTheme>,
  ThemeShadowDefinition,
  ThemeTransform<Theme, PartialTheme>,
  Typography,
  Variant,
  VariantValue,
  Variants,
  ThemeFromFlexTokensOptions,
];

export type LegacyStylingTypeInventory = [
  FontDecorationTokens,
  FontStyleTokens,
  FontTokens,
  FontVariantTokens,
  IBackgroundColorTokens,
  IBorderTokens,
  IColorTokens,
  IForegroundColorTokens,
  IShadowTokens,
  LayoutTokens,
  LookupThemePart<Theme>,
  OperationSet<object, Theme>,
  StyleFactoryFunction<object, object, Theme>,
  StyleFactoryFunctionRaw<object, object, Theme>,
  StyleFactoryOperation<object, Theme>,
  TokenBuilder<object, TextStyle>,
  NamedStyles<{ root: object }>,
];

// The root and legacy entry points keep their distinct meanings for these names.
export type RootTextAttributeInventory = [RootFontSize, RootFontWeight];

// External code declares three-field appearance literals and must keep compiling.
const legacyAppearance: ResolvedThemeAppearance = {
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'base',
};
const rootAppearance: RootResolvedThemeAppearance = {
  colorScheme: 'light',
  contrast: 'highContrast',
  interfaceLevel: 'elevated',
};
const rootAppearanceOptions: RootThemeAppearanceOptions = { colorScheme: 'system', contrast: 'standard' };
const fallbackAppearance: Partial<ResolvedThemeAppearance> = { colorScheme: 'dark' };

function externalAppearanceKey(appearance: ResolvedThemeAppearance): string {
  return themeAppearanceKey(appearance);
}

function appearanceFromState(state: ThemeState): ResolvedThemeAppearance {
  return state.appearance;
}

const legacyTransform: ThemeTransform<Theme, PartialTheme> = (parent: Theme, appearance?: ResolvedThemeAppearance) => ({
  colors: { bodyText: appearance?.colorScheme === 'dark' ? parent.colors.bodyText : '#010203' },
});

describe('legacy compatibility types', () => {
  it('accepts three-field appearance values at every legacy-facing boundary', () => {
    expect(externalAppearanceKey(legacyAppearance)).toBe('dark|standard|base');
    expect(themeAppearanceKey(rootAppearance)).toBe('light|highContrast|elevated');
    expect(resolveThemeAppearance(rootAppearanceOptions, {}, fallbackAppearance).resolved).toEqual(
      expect.objectContaining({ colorScheme: 'dark', contrast: 'standard', interfaceLevel: 'base' }),
    );

    const legacyTheme = getDefaultLegacyTheme(legacyAppearance);
    expect(getDefaultLegacyThemeOnly(legacyAppearance)).toBe(legacyTheme);
    expect(themeFromFlexTokens(flexTokensFromTheme(legacyTheme), legacyAppearance).host.appearance).toBe('dark');

    const reference = new ThemeReference(legacyTheme, legacyTransform);
    expect(reference.resolveTheme(legacyAppearance).colors.bodyText).toBe(legacyTheme.colors.bodyText);
    expect(reference.resolveTheme(rootAppearance).colors.bodyText).toBe('#010203');
    expect(appearanceFromState).toEqual(expect.any(Function));
  });

  it('shares legacy constructors and contexts across entry points', () => {
    expect(LegacySourceThemeReference).toBe(ThemeReference);
    expect(ThemeContext).toBeDefined();
    expect(ThemeProvider).toEqual(expect.any(Function));
    expect(useTheme).toEqual(expect.any(Function));
    expect(useThemeState).toEqual(expect.any(Function));
  });

  it('keeps legacy utility and token builder values', () => {
    for (const value of [
      getCurrentAppearance,
      isHighContrast,
      mapFontPipelineToTheme,
      mapPipelineToShadow,
      mapPipelineToTheme,
      setIsHighContrast,
      getAliasTokens,
      getShadowTokens,
      themedStyleSheet,
      backgroundColorTokens,
      borderStyles,
      borderTokens,
      colorTokens,
      fontStyles,
      foregroundColorTokens,
      getPaletteFromTheme,
      layoutStyles,
      layoutTokens,
      shadowStyles,
      shadowTokens,
      styleFunction,
      textTokens,
      tokenBuilder,
    ]) {
      expect(value).toBeDefined();
    }
    expect(globalTokens).toBeDefined();
    expect(hcAliasTokens).toBeDefined();
  });
});
