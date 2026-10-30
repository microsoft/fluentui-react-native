import { fontAliasTokens } from '../../fluent/defaults/fluentTokens.generated';
import type { AliasColorTokens } from '../../fluent/types/Color.types';
import type { BaseShadowAliasTokens } from '../../fluent/types/Shadow.types';
import type { Spacing, Theme } from '../../fluent/types/Theme.types';
import {
  fontFamilyBase,
  fontFamilyMonospace,
  fontFamilyNumeric,
  fontSize100,
  fontSize200,
  fontSize300,
  fontSize400,
  fontSize500,
  fontSize700,
  fontSize900,
  fontWeightRegular,
  fontWeightSemibold,
  size160,
  size200,
  size320,
  size40,
  size80,
} from '../../tokens/global.generated';
import { legacyPaletteFromAliasColors } from './legacyPalette';

/**
 * Assemble a complete legacy `Theme` from Fluent 2 tokens. The theme is a view over the generated alias colors,
 * shadows and font variants plus global tokens, so nothing here is a hand-picked value. Appearance data is a
 * parameter so that bundlers can drop the appearance a consumer never imports.
 */
export function createFluentTheme(
  appearance: 'light' | 'dark',
  aliasColors: Required<AliasColorTokens>,
  shadows: BaseShadowAliasTokens,
): Theme {
  const spacing: Spacing = {
    s2: `${size40}px`,
    s1: `${size80}px`,
    m: `${size160}px`,
    l1: `${size200}px`,
    l2: `${size320}px`,
  };

  return {
    colors: { ...aliasColors, ...legacyPaletteFromAliasColors(aliasColors) },
    typography: {
      // Fluent 2 defines no serif or cursive family, so those slots use the base family
      families: {
        primary: fontFamilyBase,
        secondary: fontFamilyBase,
        cursive: fontFamilyBase,
        monospace: fontFamilyMonospace,
        numeric: fontFamilyNumeric,
        sansSerif: fontFamilyBase,
        serif: fontFamilyBase,
      },
      sizes: {
        caption: fontSize100,
        secondary: fontSize200,
        body: fontSize300,
        subheader: fontSize400,
        header: fontSize500,
        hero: fontSize700,
        heroLarge: fontSize900,
      },
      weights: {
        regular: fontWeightRegular,
        semiBold: fontWeightSemibold,
      },
      variants: fontAliasTokens,
    },
    components: {},
    shadows: { ...shadows },
    spacing,
    host: { appearance },
  };
}
