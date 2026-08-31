import type { ColorValue } from 'react-native';

import { rgbToOklch, oklchToRgb } from './conversion';
import { channelToByte, clamp } from './math';
import { parseColorValue, rgbaToHex } from './parsing';
import type {
  ColorMode,
  InteractionColorDiagnostic,
  InteractionColorInput,
  InteractionColorOptions,
  InteractionColorOverridesResult,
  InteractionColorResult,
  InteractionColorsResult,
  InteractionColorState,
  InteractiveColorToken,
  RgbColor,
  RgbaColor,
} from './types';
import type { InteractiveColorOverrides, SemanticColors, SemanticColorTokenValues } from '../tokens/flex.types';

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

/** Default interaction lightness and alpha shifts for each state and mode. */
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

/** Reference surfaces used to solve translucent Bebop Warm source colors. */
export const BEBOP_WARM_REFERENCE_BACKDROP = {
  light: '#ffffff',
  dark: '#292929',
} as const;

/**
 * Return whether a semantic interaction token shifts opposite the standard
 * lightness direction.
 */
export function isInverseInteractionToken(token: InteractiveColorToken): boolean {
  return /heavy|loud|onloud/i.test(token);
}

function interactionCurveMultiplier(lightness: number): number {
  return clamp((0.5 - lightness) / 0.1, 1, 3);
}

function defaultInteractionColor(color: RgbaColor, token: InteractiveColorToken, mode: ColorMode, state: InteractionColorState): string {
  const oklch = rgbToOklch(color);
  const delta = INTERACTION_COLOR_DELTAS[state][mode];
  const inverse = isInverseInteractionToken(token);
  const rgb = oklchToRgb({
    ...oklch,
    L: clamp(oklch.L + (inverse ? -1 : 1) * delta.lightness * interactionCurveMultiplier(oklch.L)),
  });
  return rgbaToHex({
    ...rgb,
    a: inverse ? color.a : clamp(color.a + delta.alpha),
  });
}

function compositeChannel(source: number, backdrop: number, alpha: number): number {
  return Math.round((source * alpha + backdrop * (255 - alpha)) / 255);
}

function solveSourceChannel(target: number, backdrop: number, alpha: number): number {
  let best = 0;
  let bestError = Number.POSITIVE_INFINITY;
  let bestDistance = Number.POSITIVE_INFINITY;
  const preferred = (target * 255 - backdrop * (255 - alpha)) / alpha;

  for (let source = 0; source <= 255; source += 1) {
    const error = Math.abs(compositeChannel(source, backdrop, alpha) - target);
    const distance = Math.abs(source - preferred);
    if (error < bestError || (error === bestError && distance < bestDistance)) {
      best = source;
      bestError = error;
      bestDistance = distance;
    }
  }
  return best;
}

function warmInteractionRgb(color: RgbColor, alpha: number, mode: ColorMode, state: InteractionColorState, inverse: boolean): RgbColor {
  const { L, C, h } = rgbToOklch(color);
  const delta = INTERACTION_COLOR_DELTAS[state][mode].lightness;
  const opacityFactor = clamp(alpha + 0.35, 0.35, 1);
  const chromaDelta = state === 'pressed' ? Math.min(Math.max(0.006, C * 0.08), 0.012) : Math.min(Math.max(0.003, C * 0.04), 0.006);
  let nextLightness = inverse
    ? L - delta * interactionCurveMultiplier(L) * opacityFactor
    : L + delta * interactionCurveMultiplier(L) * opacityFactor;

  if (!inverse && mode === 'light') {
    nextLightness = Math.max(nextLightness, state === 'pressed' ? 0.08 : 0.1);
  }
  if (!inverse && mode === 'dark') {
    nextLightness = Math.min(nextLightness, state === 'pressed' ? 0.992 : 0.985);
  }
  return oklchToRgb({ L: clamp(nextLightness), C: C + chromaDelta, h });
}

function isTranslucentSurfaceToken(token: InteractiveColorToken, alpha: number): boolean {
  return (token.startsWith('background') || token.startsWith('stroke')) && alpha > 1e-9 && alpha < 1 - 1e-9;
}

function bebopWarmInteractionColor(color: RgbaColor, token: InteractiveColorToken, mode: ColorMode, state: InteractionColorState): string {
  const inverse = isInverseInteractionToken(token);
  const alpha = inverse ? color.a : clamp(color.a + INTERACTION_COLOR_DELTAS[state][mode].alpha);

  if (isTranslucentSurfaceToken(token, color.a)) {
    const source = [channelToByte(color.r), channelToByte(color.g), channelToByte(color.b)];
    const backdrop = mode === 'light' ? [255, 255, 255] : [41, 41, 41];
    const sourceAlpha = channelToByte(color.a);
    const targetAlpha = channelToByte(alpha);
    const apparent = source.map((channel, index) => compositeChannel(channel, backdrop[index], sourceAlpha));
    const shifted = warmInteractionRgb({ r: apparent[0] / 255, g: apparent[1] / 255, b: apparent[2] / 255 }, color.a, mode, state, inverse);
    const target = [channelToByte(shifted.r), channelToByte(shifted.g), channelToByte(shifted.b)];
    const solved = target.map((channel, index) => solveSourceChannel(channel, backdrop[index], targetAlpha));
    return rgbaToHex({ r: solved[0] / 255, g: solved[1] / 255, b: solved[2] / 255, a: targetAlpha / 255 });
  }

  return rgbaToHex({
    ...warmInteractionRgb(color, color.a, mode, state, inverse),
    a: alpha,
  });
}

/**
 * Generate one interaction-state color with either the default or Bebop Warm
 * OKLCH algorithm.
 */
export function getInteractionColor(
  colorValue: ColorValue,
  token: InteractiveColorToken,
  mode: ColorMode,
  state: InteractionColorState,
  options: InteractionColorOptions = {},
): InteractionColorResult {
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

  return {
    status: 'derived',
    value:
      options.variant === 'bebopWarm'
        ? bebopWarmInteractionColor(parsed.color, token, mode, state)
        : defaultInteractionColor(parsed.color, token, mode, state),
  };
}

/** Generate a hover color from a semantic token's rest value. */
export function getHoverColor(
  colorValue: ColorValue,
  token: InteractiveColorToken,
  mode: ColorMode,
  options?: InteractionColorOptions,
): InteractionColorResult {
  return getInteractionColor(colorValue, token, mode, 'hover', options);
}

/** Generate a pressed color from a semantic token's rest value. */
export function getPressColor(
  colorValue: ColorValue,
  token: InteractiveColorToken,
  mode: ColorMode,
  options?: InteractionColorOptions,
): InteractionColorResult {
  return getInteractionColor(colorValue, token, mode, 'pressed', options);
}

/**
 * Generate every interactive token override for one state and collect
 * diagnostics for colors that JavaScript cannot resolve.
 */
export function getInteractionColorOverrides(
  colors: SemanticColorTokenValues,
  mode: ColorMode,
  state: InteractionColorState,
  options?: InteractionColorOptions,
): InteractionColorOverridesResult {
  const overrides: InteractiveColorOverrides = {};
  const diagnostics: InteractionColorDiagnostic[] = [];

  for (const token of INTERACTIVE_COLOR_TOKENS) {
    const result = getInteractionColor(colors[token], token, mode, state, options);
    if (result.status === 'derived') {
      overrides[token] = result.value;
    } else {
      diagnostics.push(result.diagnostic);
    }
  }

  return { overrides, diagnostics };
}

/**
 * Fill missing hover and pressed colors without replacing authored values.
 * Callers should not apply this fallback to high-contrast themes.
 */
export function getInteractionColors(
  colors: InteractionColorInput,
  mode: ColorMode,
  options?: InteractionColorOptions,
): InteractionColorsResult {
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
      const result = getInteractionColor(colors[token], token, mode, state, options);
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
