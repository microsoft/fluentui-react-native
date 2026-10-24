import type { InteractionCompositing, InteractionDirection } from '../../color-lib/types';
import type { InteractiveColorOverrides } from '../tokens.types';

/** A Flex semantic color token that has hover and pressed states. */
export type InteractiveColorToken = keyof InteractiveColorOverrides;

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

/**
 * Return whether an interactive token shifts opposite the standard lightness
 * direction. Heavy, loud, and on-loud roles are inverted.
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
