/**
 * Parity tests for `src/metadata.ts`.
 *
 * Two layers:
 *
 *   1. Type-level — the `Expect<extends never>` aliases below fail to
 *      compile if a key is added to one of the source interfaces without
 *      being added to the corresponding tuple (or vice versa). `tsgo`
 *      catches this during build/test compilation, before Jest even runs.
 *      The aliases are `export`ed so `noUnusedLocals` doesn't strip
 *      them; TypeScript erases type-only exports from the emitted JS,
 *      so this stays a zero-runtime-cost mechanism.
 *
 *   2. Runtime — uniqueness and spot-checks. These also exercise the
 *      `./metadata` module so a regression that silently empties a tuple
 *      is caught.
 *
 * If a parity check fails to compile, the message will point at one of
 * the `Expect<...>` aliases below. The mismatched keys appear in the
 * `Exclude<>` it wraps — that tells you exactly which tuple to fix.
 */
import type {
  AliasColorTokens,
  ControlColorTokens,
  PaletteBackgroundColors,
  PaletteTextColors,
} from '../Color.types';
import type { BaseShadowAliasTokens } from '../Shadow.types';
import type { Spacing } from '../Theme.types';
import type { FontFamilies, FontSizes, FontWeights, Variants } from '../Typography.types';

import {
  COLOR_TOKEN_NAMES,
  SHADOW_TOKEN_NAMES,
  SPACING_TOKEN_NAMES,
  TYPOGRAPHY_FAMILY_NAMES,
  TYPOGRAPHY_SIZE_NAMES,
  TYPOGRAPHY_VARIANT_NAMES,
  TYPOGRAPHY_WEIGHT_NAMES,
  type ColorTokenName,
  type ShadowTokenName,
  type SpacingTokenName,
  type TypographyFamilyName,
  type TypographySizeName,
  type TypographyVariantName,
  type TypographyWeightName,
} from '../metadata';

// ---- Type-level parity ----------------------------------------------------------------------

// `Expect<T>` constrains its argument to be exactly `never`. If `T` is any
// non-never union, the `extends never` constraint fails to satisfy and
// tsgo reports an error. We use it to assert symmetric difference (the
// two `Exclude<>`s) is empty.
type Expect<T extends never> = T;

// Color universe = every named key reachable through `Theme['colors']`,
// minus the open `[k: string]: ColorValue` index signature. The four
// required `ThemeColorDefinition` keys (background, bodyText, subText,
// disabledText) all already live in the palette interfaces below, so
// the union is exactly the four sources joined.
type StrictColorKey =
  | keyof PaletteTextColors
  | keyof PaletteBackgroundColors
  | keyof ControlColorTokens
  | keyof AliasColorTokens;

export type _ColorParity = [
  Expect<Exclude<StrictColorKey, ColorTokenName>>,
  Expect<Exclude<ColorTokenName, StrictColorKey>>,
];

export type _SpacingParity = [
  Expect<Exclude<keyof Spacing, SpacingTokenName>>,
  Expect<Exclude<SpacingTokenName, keyof Spacing>>,
];

export type _ShadowParity = [
  Expect<Exclude<keyof BaseShadowAliasTokens, ShadowTokenName>>,
  Expect<Exclude<ShadowTokenName, keyof BaseShadowAliasTokens>>,
];

export type _FontFamilyParity = [
  Expect<Exclude<keyof FontFamilies, TypographyFamilyName>>,
  Expect<Exclude<TypographyFamilyName, keyof FontFamilies>>,
];

export type _FontSizeParity = [
  Expect<Exclude<keyof FontSizes, TypographySizeName>>,
  Expect<Exclude<TypographySizeName, keyof FontSizes>>,
];

export type _FontWeightParity = [
  Expect<Exclude<keyof FontWeights, TypographyWeightName>>,
  Expect<Exclude<TypographyWeightName, keyof FontWeights>>,
];

export type _VariantParity = [
  Expect<Exclude<keyof Variants, TypographyVariantName>>,
  Expect<Exclude<TypographyVariantName, keyof Variants>>,
];

// ---- Runtime checks -------------------------------------------------------------------------

describe('metadata token tuples', () => {
  const groups = [
    ['COLOR_TOKEN_NAMES', COLOR_TOKEN_NAMES],
    ['SPACING_TOKEN_NAMES', SPACING_TOKEN_NAMES],
    ['SHADOW_TOKEN_NAMES', SHADOW_TOKEN_NAMES],
    ['TYPOGRAPHY_FAMILY_NAMES', TYPOGRAPHY_FAMILY_NAMES],
    ['TYPOGRAPHY_SIZE_NAMES', TYPOGRAPHY_SIZE_NAMES],
    ['TYPOGRAPHY_WEIGHT_NAMES', TYPOGRAPHY_WEIGHT_NAMES],
    ['TYPOGRAPHY_VARIANT_NAMES', TYPOGRAPHY_VARIANT_NAMES],
  ] as const;

  it.each(groups)('%s contains no duplicates', (_name, tuple) => {
    expect(new Set(tuple).size).toBe(tuple.length);
  });

  it.each(groups)('%s is non-empty', (_name, tuple) => {
    expect(tuple.length).toBeGreaterThan(0);
  });

  // Spot-checks: well-known keys that anchor the tuples to the design system.
  // If one of these disappears, either the type changed (in which case the
  // type-level parity check above will also fail) or the tuple was edited
  // incorrectly (the type check passes but this fails — pointing at the
  // exact key).
  it('contains canonical color anchors', () => {
    expect(COLOR_TOKEN_NAMES).toContain('background');
    expect(COLOR_TOKEN_NAMES).toContain('bodyText');
    expect(COLOR_TOKEN_NAMES).toContain('brandBackground');
    expect(COLOR_TOKEN_NAMES).toContain('neutralForeground1');
  });

  it('contains all canonical shadow elevations', () => {
    expect(SHADOW_TOKEN_NAMES).toContain('shadow2');
    expect(SHADOW_TOKEN_NAMES).toContain('shadow64');
    expect(SHADOW_TOKEN_NAMES).toContain('shadow16brand');
  });

  it('contains canonical typography variant anchors', () => {
    expect(TYPOGRAPHY_VARIANT_NAMES).toContain('bodyStandard'); // v1
    expect(TYPOGRAPHY_VARIANT_NAMES).toContain('body1'); // v2
  });

  // Fixed counts caught a phantom token in the analyzer's hand-curated
  // list (a non-existent `buttonIcon`) and a class of off-type names
  // pulled from a deprecated palette. Pinning the count makes any future
  // type-vs-tuple drift impossible to land silently — a coverage change
  // here is a deliberate, reviewable diff.
  it('has the expected token counts', () => {
    expect(COLOR_TOKEN_NAMES.length).toBe(316);
    expect(SPACING_TOKEN_NAMES.length).toBe(5);
    expect(SHADOW_TOKEN_NAMES.length).toBe(12);
    expect(TYPOGRAPHY_FAMILY_NAMES.length).toBe(7);
    expect(TYPOGRAPHY_SIZE_NAMES.length).toBe(7);
    expect(TYPOGRAPHY_WEIGHT_NAMES.length).toBe(2);
    expect(TYPOGRAPHY_VARIANT_NAMES.length).toBe(30);
  });
});
