import type { ColorValue } from 'react-native';

import { getInteractionColor } from '../../color-lib/interaction';
import { parseColorValue } from '../../color-lib/parsing';
import type { InteractionColorState, InteractionDirection } from '../../color-lib/types';
import type { NormalizedThemeAppearance } from '../../types/appearance.types';
import { resolveFlexTokenDescriptionWith } from '../flexTokenDescription';
import type { FlexColorDescription, FlexTokenDescription, FlexTokens, InteractiveColor } from '../tokens.types';
import { selectColorEntry } from './flexColor';
import { createInteractiveColor } from './interactiveColor';
import type { InteractiveColorState } from './interactiveColor';
import { getInteractionCompositing, isInteractiveColorToken } from './interactiveTokens';
import type { InteractiveColorToken } from './interactiveTokens';

/**
 * Compute one interaction state for a Flex token from its rest value. High
 * contrast and rest values the raw engine cannot map, such as native platform
 * colors, resolve to the rest value itself.
 */
export function deriveInteractionColor(
  rest: ColorValue,
  token: InteractiveColorToken,
  state: InteractionColorState,
  direction: InteractionDirection,
  appearance: Readonly<NormalizedThemeAppearance>,
): ColorValue {
  if (appearance.contrast === 'highContrast') {
    return rest;
  }

  const result = getInteractionColor(rest, appearance.colorScheme, state, {
    colorTone: appearance.colorTone,
    direction,
    compositing: getInteractionCompositing(token),
  });
  return result.status === 'derived' ? result.value : rest;
}

function resolveState(
  token: string,
  description: FlexColorDescription,
  state: InteractionColorState,
  rest: ColorValue,
  appearance: Readonly<NormalizedThemeAppearance>,
): InteractiveColorState {
  const explicit = description[state];
  if (explicit !== undefined) {
    return selectColorEntry(explicit, appearance);
  }
  if (!isInteractiveColorToken(token)) {
    return rest;
  }

  const { type } = description;
  if (type === 'fixed') {
    if (parseColorValue(rest).status === 'resolved') {
      throw new Error(
        `Flex color "${token}" has type "fixed" and no explicit ${state} value. Fixed interaction derivation is not defined; author explicit hover and pressed values.`,
      );
    }
    return rest;
  }
  if (appearance.contrast === 'highContrast') {
    return rest;
  }
  return () => deriveInteractionColor(rest, token, state, type, appearance);
}

/**
 * Resolve one authored color for an appearance. Explicit states win. Omitted
 * states of interactive tokens are computed on first read from rest, using the
 * description's type for direction; other tokens and high contrast use rest.
 * A fixed interactive color whose rest the engine can map must author every
 * state, and throws here otherwise.
 */
export function resolveFlexColor(
  token: string,
  description: FlexColorDescription,
  appearance: Readonly<NormalizedThemeAppearance>,
): InteractiveColor {
  const rest = selectColorEntry(description.rest, appearance);
  return createInteractiveColor(
    rest,
    resolveState(token, description, 'hover', rest, appearance),
    resolveState(token, description, 'pressed', rest, appearance),
  );
}

/** Resolve a normalized token description for an appearance. */
export function resolveFlexTokenDescription(
  description: FlexTokenDescription,
  appearance: Readonly<NormalizedThemeAppearance>,
): FlexTokens {
  return resolveFlexTokenDescriptionWith(description, appearance, resolveFlexColor);
}
