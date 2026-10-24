import type { ColorValue } from 'react-native';

import { getInteractionColor } from '../../color-lib/interaction';
import type { InteractionColorState } from '../../color-lib/types';
import type { NormalizedThemeAppearance } from '../../types/appearance.types';
import type { InteractiveColorOverrides, SemanticColors } from '../tokens.types';
import { getInteractionCompositing, getInteractionDirection, INTERACTIVE_COLOR_TOKENS } from './interactiveTokens';
import type { InteractiveColorToken } from './interactiveTokens';

/**
 * Resolve an omitted interaction state for one Flex token from its rest value.
 * High contrast and rest values the raw engine cannot map, such as native
 * platform colors, resolve to the rest value itself.
 */
export function deriveInteractionColor(
  rest: ColorValue,
  token: InteractiveColorToken,
  state: InteractionColorState,
  appearance: Readonly<NormalizedThemeAppearance>,
): ColorValue {
  if (appearance.contrast === 'highContrast') {
    return rest;
  }

  const result = getInteractionColor(rest, appearance.colorScheme, state, {
    colorTone: appearance.colorTone,
    direction: getInteractionDirection(token),
    compositing: getInteractionCompositing(token),
  });
  return result.status === 'derived' ? result.value : rest;
}

/**
 * Fill each omitted hover and pressed value for the interactive tokens while
 * keeping authored values. Returns the input when nothing is omitted.
 */
export function withDerivedInteractionColors(colors: SemanticColors, appearance: Readonly<NormalizedThemeAppearance>): SemanticColors {
  let hover: InteractiveColorOverrides | undefined;
  let pressed: InteractiveColorOverrides | undefined;

  for (const token of INTERACTIVE_COLOR_TOKENS) {
    const rest = colors[token];
    if (rest === undefined) {
      continue;
    }
    if (colors.hover?.[token] === undefined) {
      hover ??= { ...colors.hover };
      hover[token] = deriveInteractionColor(rest, token, 'hover', appearance);
    }
    if (colors.pressed?.[token] === undefined) {
      pressed ??= { ...colors.pressed };
      pressed[token] = deriveInteractionColor(rest, token, 'pressed', appearance);
    }
  }

  return hover || pressed ? { ...colors, hover: hover ?? colors.hover, pressed: pressed ?? colors.pressed } : colors;
}
