import type { ColorValue } from 'react-native';

import { rgbToOklch, oklchToRgb } from './conversion';
import { channelToByte, clamp } from './math';
import { parseColorValue, rgbaToHex } from './parsing';
import type { ColorMode, InteractionColorOptions, InteractionColorResult, InteractionColorState, RgbColor, RgbaColor } from './types';

/**
 * Default interaction lightness and alpha shifts for each state and mode.
 *
 * Source: x3-design/fluent-design@d334acf5cbad813f2b7cd554da942b09a7ff8f10.
 */
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

/**
 * Reference surfaces, as 8-bit sRGB channels, that the warm transform uses to
 * solve translucent colors: `#ffffff` in light mode and `#292929` in dark mode.
 */
export const WARM_REFERENCE_BACKDROP = {
  light: [255, 255, 255],
  dark: [41, 41, 41],
} as const;

function interactionCurveMultiplier(lightness: number): number {
  return clamp((0.5 - lightness) / 0.1, 1, 3);
}

function isTranslucent(alpha: number): boolean {
  return alpha > 1e-9 && alpha < 1 - 1e-9;
}

function coolInteractionColor(color: RgbaColor, mode: ColorMode, state: InteractionColorState, inverse: boolean): string {
  const oklch = rgbToOklch(color);
  const delta = INTERACTION_COLOR_DELTAS[state][mode];
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

function warmInteractionColor(
  color: RgbaColor,
  mode: ColorMode,
  state: InteractionColorState,
  inverse: boolean,
  backdrop: boolean,
): string {
  const alpha = inverse ? color.a : clamp(color.a + INTERACTION_COLOR_DELTAS[state][mode].alpha);

  if (backdrop && isTranslucent(color.a)) {
    const source = [channelToByte(color.r), channelToByte(color.g), channelToByte(color.b)];
    const reference = WARM_REFERENCE_BACKDROP[mode];
    const sourceAlpha = channelToByte(color.a);
    const targetAlpha = channelToByte(alpha);
    const apparent = source.map((channel, index) => compositeChannel(channel, reference[index], sourceAlpha));
    const shifted = warmInteractionRgb({ r: apparent[0] / 255, g: apparent[1] / 255, b: apparent[2] / 255 }, color.a, mode, state, inverse);
    const target = [channelToByte(shifted.r), channelToByte(shifted.g), channelToByte(shifted.b)];
    const solved = target.map((channel, index) => solveSourceChannel(channel, reference[index], targetAlpha));
    return rgbaToHex({ r: solved[0] / 255, g: solved[1] / 255, b: solved[2] / 255, a: targetAlpha / 255 });
  }

  return rgbaToHex({
    ...warmInteractionRgb(color, color.a, mode, state, inverse),
    a: alpha,
  });
}

/**
 * Generate one interaction-state color from a rest color with the cool or
 * warm OKLCH algorithm. Colors JavaScript cannot resolve return a structured
 * diagnostic instead of a fabricated value.
 */
export function getInteractionColor(
  colorValue: ColorValue,
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
        state,
      },
    };
  }

  const inverse = options.direction === 'inverted';
  return {
    status: 'derived',
    value:
      options.colorTone === 'warm'
        ? warmInteractionColor(parsed.color, mode, state, inverse, options.compositing === 'backdrop')
        : coolInteractionColor(parsed.color, mode, state, inverse),
  };
}

/** Generate a hover color from a rest color. */
export function getHoverColor(colorValue: ColorValue, mode: ColorMode, options?: InteractionColorOptions): InteractionColorResult {
  return getInteractionColor(colorValue, mode, 'hover', options);
}

/** Generate a pressed color from a rest color. */
export function getPressColor(colorValue: ColorValue, mode: ColorMode, options?: InteractionColorOptions): InteractionColorResult {
  return getInteractionColor(colorValue, mode, 'pressed', options);
}
