import type { ColorValue } from 'react-native';

import { clamp, parseColorValue, rgbaToHex } from '../color/colorValue';
import type { ColorDiagnostic, RgbaColor } from '../color/colorValue';
import type { ThemeColorScheme } from '../theming/appearance.types';
import type { InteractiveColorOverrides, SemanticColors, SemanticColorTokenValues } from '../tokens/flex.types';

export type { ColorDiagnostic, ColorDiagnosticReason } from '../color/colorValue';

export type InteractionColorState = 'hover' | 'pressed';
export type InteractiveColorToken = keyof InteractiveColorOverrides;

export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface OklchColor {
  readonly L: number;
  readonly C: number;
  readonly h: number;
}

export interface InteractionColorDiagnostic extends ColorDiagnostic {
  readonly token: InteractiveColorToken;
  readonly state: InteractionColorState;
}

export type DerivedInteractionColor =
  | {
      readonly status: 'derived';
      readonly value: string;
    }
  | {
      readonly status: 'unresolvable';
      readonly value: ColorValue;
      readonly diagnostic: InteractionColorDiagnostic;
    };

export interface InteractionColorOverridesResult {
  readonly overrides: InteractiveColorOverrides;
  readonly diagnostics: readonly InteractionColorDiagnostic[];
}

export type InteractionColorInput = SemanticColorTokenValues & {
  readonly hover?: InteractiveColorOverrides;
  readonly pressed?: InteractiveColorOverrides;
};

export interface DerivedInteractionColorsResult {
  readonly colors: SemanticColors;
  readonly diagnostics: readonly InteractionColorDiagnostic[];
}

/**
 * Interactive subset of the Flex semantic color tokens.
 *
 * Source: x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10.
 */
export const INTERACTIVE_COLOR_TOKENS = [
  'surfaceNeutralFarther',
  'surfaceNeutralFar',
  'surfaceNeutralNear',
  'surfaceNeutralNearer',
  'surfaceNeutralTranslucent',
  'backgroundNeutralHeavy',
  'backgroundNeutralLoud',
  'backgroundNeutralSoft',
  'backgroundNeutralSubtle',
  'backgroundNeutralTransparent',
  'backgroundNeutralTranslucent',
  'backgroundBrandHeavy',
  'backgroundBrandLoud',
  'backgroundBrandSoft',
  'backgroundBrandSubtle',
  'backgroundBrandTransparent',
  'backgroundDangerLoud',
  'backgroundDangerSoft',
  'backgroundDangerSubtle',
  'backgroundWarningLoud',
  'backgroundWarningSoft',
  'backgroundWarningSubtle',
  'backgroundSuccessLoud',
  'backgroundSuccessSoft',
  'backgroundSuccessSubtle',
  'strokeNeutralHeavy',
  'strokeNeutralLoud',
  'strokeNeutralSoft',
  'strokeNeutralSubtle',
  'strokeNeutralTransparent',
  'strokeNeutralOnloud',
  'strokeBrandLoud',
  'strokeBrandSoft',
  'strokeBrandSubtle',
  'strokeBrandOnloud',
  'strokeDangerLoud',
  'strokeDangerSoft',
  'strokeDangerSubtle',
  'strokeDangerOnloud',
  'strokeWarningLoud',
  'strokeWarningSoft',
  'strokeWarningSubtle',
  'strokeWarningOnloud',
  'strokeSuccessLoud',
  'strokeSuccessSoft',
  'strokeSuccessSubtle',
  'strokeSuccessOnloud',
  'foregroundNeutralPrimary',
  'foregroundNeutralSecondary',
  'foregroundNeutralTertiary',
  'foregroundNeutralOnloud',
  'foregroundBrandPrimary',
  'foregroundBrandOnloud',
  'foregroundDangerPrimary',
  'foregroundDangerOnloud',
  'foregroundWarningPrimary',
  'foregroundWarningOnloud',
  'foregroundSuccessPrimary',
  'foregroundSuccessOnloud',
] as const satisfies readonly InteractiveColorToken[];

export const INTERACTION_COLOR_DELTAS = {
  hover: {
    light: { lightness: -0.03, alpha: 0.04 },
    dark: { lightness: 0.03, alpha: 0.03 },
  },
  pressed: {
    light: { lightness: -0.06, alpha: 0.08 },
    dark: { lightness: 0.06, alpha: 0.06 },
  },
} as const;

function srgbToLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

export function rgbToOklch({ r, g, b }: RgbColor): OklchColor {
  const red = srgbToLinear(r);
  const green = srgbToLinear(g);
  const blue = srgbToLinear(b);

  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;

  const lRoot = Math.cbrt(l);
  const mRoot = Math.cbrt(m);
  const sRoot = Math.cbrt(s);

  const L = 0.2104542553 * lRoot + 0.793617785 * mRoot - 0.0040720468 * sRoot;
  const a = 1.9779984951 * lRoot - 2.428592205 * mRoot + 0.4505937099 * sRoot;
  const bLab = 0.0259040371 * lRoot + 0.7827717662 * mRoot - 0.808675766 * sRoot;
  const h = (Math.atan2(bLab, a) * 180) / Math.PI;

  return {
    L,
    C: Math.sqrt(a * a + bLab * bLab),
    h: (h + 360) % 360,
  };
}

export function oklchToRgb({ L, C, h }: OklchColor): RgbColor {
  const radians = (h * Math.PI) / 180;
  const a = C * Math.cos(radians);
  const b = C * Math.sin(radians);

  const lRoot = L + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = L - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = L - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot * lRoot * lRoot;
  const m = mRoot * mRoot * mRoot;
  const s = sRoot * sRoot * sRoot;

  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function isInverseInteractionToken(token: InteractiveColorToken): boolean {
  return /heavy|loud|onloud/i.test(token);
}

function interactionCurveMultiplier(lightness: number): number {
  return clamp((0.5 - lightness) / 0.1, 1, 3);
}

export function deriveInteractionColor(
  colorValue: ColorValue,
  token: InteractiveColorToken,
  mode: ThemeColorScheme,
  state: InteractionColorState,
): DerivedInteractionColor {
  const parsed = parseColorValue(colorValue);
  if (parsed.status === 'unresolvable') {
    return {
      status: 'unresolvable',
      value: colorValue,
      diagnostic: {
        ...parsed.diagnostic,
        token,
        state,
      },
    };
  }

  const oklch = rgbToOklch(parsed.color);
  const delta = INTERACTION_COLOR_DELTAS[state][mode];
  const direction = isInverseInteractionToken(token) ? -1 : 1;
  const rgb = oklchToRgb({
    ...oklch,
    L: clamp(oklch.L + direction * delta.lightness * interactionCurveMultiplier(oklch.L)),
  });
  const result: RgbaColor = {
    ...rgb,
    a: isInverseInteractionToken(token) ? parsed.color.a : clamp(parsed.color.a + delta.alpha),
  };

  return {
    status: 'derived',
    value: rgbaToHex(result),
  };
}

export function deriveInteractionColorOverrides(
  colors: SemanticColorTokenValues,
  mode: ThemeColorScheme,
  state: InteractionColorState,
): InteractionColorOverridesResult {
  const overrides: InteractiveColorOverrides = {};
  const diagnostics: InteractionColorDiagnostic[] = [];

  for (const token of INTERACTIVE_COLOR_TOKENS) {
    const result = deriveInteractionColor(colors[token], token, mode, state);
    if (result.status === 'derived') {
      overrides[token] = result.value;
    } else {
      diagnostics.push(result.diagnostic);
    }
  }

  return { overrides, diagnostics };
}

/**
 * Fill missing interaction states without replacing authored values.
 *
 * Callers must use the resolved light/dark scheme and should not invoke this
 * fallback for high-contrast themes.
 */
export function deriveInteractionColors(colors: InteractionColorInput, mode: ThemeColorScheme): DerivedInteractionColorsResult {
  const hover: InteractiveColorOverrides = { ...colors.hover };
  const pressed: InteractiveColorOverrides = { ...colors.pressed };
  const diagnostics: InteractionColorDiagnostic[] = [];
  let changed = colors.hover === undefined || colors.pressed === undefined;

  for (const state of ['hover', 'pressed'] as const) {
    const overrides = state === 'hover' ? hover : pressed;
    for (const token of INTERACTIVE_COLOR_TOKENS) {
      if (overrides[token] !== undefined) {
        continue;
      }
      const result = deriveInteractionColor(colors[token], token, mode, state);
      if (result.status === 'derived') {
        overrides[token] = result.value;
        changed = true;
      } else {
        diagnostics.push(result.diagnostic);
      }
    }
  }

  return {
    colors: changed ? { ...colors, hover, pressed } : (colors as SemanticColors),
    diagnostics,
  };
}
