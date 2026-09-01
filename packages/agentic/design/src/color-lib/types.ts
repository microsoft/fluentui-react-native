import type { ColorValue } from 'react-native';

import type { ThemeColorScheme } from '../theming/appearance.types';
import type { InteractiveColorOverrides, SemanticColors, SemanticColorTokenValues } from '../tokens/flex.types';

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
export type InteractionColorVariant = 'default' | 'bebopWarm';
export type InteractiveColorToken = keyof InteractiveColorOverrides;

export interface InteractionColorOptions {
  readonly variant?: InteractionColorVariant;
}

export interface InteractionColorDiagnostic extends ColorDiagnostic {
  readonly token: InteractiveColorToken;
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

export interface InteractionColorOverridesResult {
  readonly overrides: InteractiveColorOverrides;
  readonly diagnostics: readonly InteractionColorDiagnostic[];
}

export type InteractionColorInput = SemanticColorTokenValues & {
  readonly hover?: InteractiveColorOverrides;
  readonly pressed?: InteractiveColorOverrides;
};

export interface InteractionColorsResult {
  readonly colors: SemanticColors;
  readonly diagnostics: readonly InteractionColorDiagnostic[];
}

export type ColorMode = ThemeColorScheme;
