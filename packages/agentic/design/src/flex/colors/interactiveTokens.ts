import type { InteractionCompositing, InteractionDirection } from '../../color-lib/types';
import type { SemanticColorName } from '../tokens.types';

/**
 * Interactive subset of the Flex semantic color tokens. Only these tokens
 * compute omitted hover and pressed states; every other token's states equal
 * rest unless authored explicitly.
 *
 * Source: x3-design/fluent-design@206e890b645fb450ad7c5df2ff981765349a2b58.
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
] as const satisfies readonly SemanticColorName[];

/** A Flex semantic color token whose omitted hover and pressed states are computed. */
export type InteractiveColorToken = (typeof INTERACTIVE_COLOR_TOKENS)[number];

const interactiveColorTokens: ReadonlySet<string> = new Set(INTERACTIVE_COLOR_TOKENS);

/** Return whether a color token computes omitted hover and pressed states. */
export function isInteractiveColorToken(token: string): token is InteractiveColorToken {
  return interactiveColorTokens.has(token);
}

/**
 * Return whether an interactive token's default color type is inverted. Heavy,
 * loud, and on-loud roles shift opposite the standard lightness direction.
 * Defaults and legacy adapters use this classification; newly authored colors
 * declare their type explicitly.
 */
export function isInverseInteractionToken(token: InteractiveColorToken): boolean {
  const name = token.toLowerCase();
  return name.includes('heavy') || name.includes('loud');
}

/** The raw interaction direction for an interactive token. */
export function getInteractionDirection(token: InteractiveColorToken): InteractionDirection {
  return isInverseInteractionToken(token) ? 'inverted' : 'standard';
}

/**
 * The raw compositing intent for an interactive token. Translucent backgrounds
 * and strokes are solved against the reference backdrop.
 */
export function getInteractionCompositing(token: InteractiveColorToken): InteractionCompositing {
  return token.startsWith('background') || token.startsWith('stroke') ? 'backdrop' : 'direct';
}
