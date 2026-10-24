import type { ColorValue } from 'react-native';

import type { ColorTone, ThemeColorScheme } from '../types/appearance.types';

export type ColorDiagnosticReason = 'non-literal-color' | 'unsupported-color-format';

export interface ColorDiagnostic {
  readonly reason: ColorDiagnosticReason;
  readonly value: ColorValue;
  readonly message: string;
}

/** Normalized red, green, and blue channels in the range 0 through 1. */
export interface RgbColor {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

/** Normalized red, green, blue, and alpha channels in the range 0 through 1. */
export interface RgbaColor extends RgbColor {
  readonly a: number;
}

/** An OKLCH color with normalized lightness, chroma, and hue in degrees. */
export interface OklchColor {
  readonly L: number;
  readonly C: number;
  readonly h: number;
}

export type ParsedColorValue =
  | {
      readonly status: 'resolved';
      readonly color: RgbaColor;
    }
  | {
      readonly status: 'unresolvable';
      readonly diagnostic: ColorDiagnostic;
    };

export interface ResolvedContrastColors {
  readonly ratio: number;
  readonly foregroundResolved: string;
  readonly backgroundResolved: string;
}

export type InteractionColorState = 'hover' | 'pressed';

/**
 * Lightness direction. Inverted colors shift opposite the standard direction
 * for the scheme and keep their alpha.
 */
export type InteractionDirection = 'standard' | 'inverted';

/**
 * How the warm transform treats a translucent color. `backdrop` composites it
 * over the scheme's reference backdrop, shifts the apparent color, and solves
 * a source color at the target alpha. `direct` shifts the channels in place.
 * The cool transform always shifts directly.
 */
export type InteractionCompositing = 'direct' | 'backdrop';

export interface InteractionColorOptions {
  /** Interaction algorithm tone. Defaults to cool. */
  readonly colorTone?: ColorTone;
  /** Defaults to standard. */
  readonly direction?: InteractionDirection;
  /** Defaults to direct. */
  readonly compositing?: InteractionCompositing;
}

export interface InteractionColorDiagnostic extends ColorDiagnostic {
  readonly state: InteractionColorState;
}

export type InteractionColorResult =
  | {
      readonly status: 'derived';
      readonly value: string;
    }
  | {
      readonly status: 'unresolvable';
      readonly value: ColorValue;
      readonly diagnostic: InteractionColorDiagnostic;
    };

export type ColorMode = ThemeColorScheme;
