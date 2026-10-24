import type { ColorValue } from 'react-native';

import { getInteractionColor } from '../../color-lib/interaction';
import type { ColorMode, InteractionColorDiagnostic, InteractionColorState } from '../../color-lib/types';
import { getInteractionCompositing, getInteractionDirection, INTERACTIVE_COLOR_TOKENS } from '../../flex/colors/interactiveTokens';
import type { InteractiveColorToken } from '../../flex/colors/interactiveTokens';
import type { SemanticColors, SemanticColorTokenValues } from '../../flex/tokens.types';
import type { ColorTone } from '../../types/appearance.types';

export interface InteractionAuditDiagnostic extends InteractionColorDiagnostic {
  readonly token: InteractiveColorToken;
}

export type InteractionColorOverrides = Partial<Record<InteractiveColorToken, ColorValue>>;

export interface InteractionOverridesResult {
  readonly overrides: InteractionColorOverrides;
  readonly diagnostics: readonly InteractionAuditDiagnostic[];
}

/**
 * Test-only bulk generation of one interaction state for every interactive
 * token. Unlike the Flex runtime policy, unresolvable rest values are reported
 * for audits instead of falling back to rest.
 */
export function getInteractionColorOverrides(
  colors: SemanticColorTokenValues,
  mode: ColorMode,
  state: InteractionColorState,
  colorTone: ColorTone = 'cool',
): InteractionOverridesResult {
  const overrides: InteractionColorOverrides = {};
  const diagnostics: InteractionAuditDiagnostic[] = [];

  for (const token of INTERACTIVE_COLOR_TOKENS) {
    const result = getInteractionColor(colors[token], mode, state, {
      colorTone,
      direction: getInteractionDirection(token),
      compositing: getInteractionCompositing(token),
    });
    if (result.status === 'derived') {
      overrides[token] = result.value;
    } else {
      diagnostics.push({ ...result.diagnostic, token });
    }
  }

  return { overrides, diagnostics };
}

/**
 * The rest value of every resolved color, keyed by token.
 */
export function restColorValues(colors: SemanticColors): SemanticColorTokenValues {
  return Object.fromEntries(Object.entries(colors).map(([name, color]) => [name, color.rest])) as SemanticColorTokenValues;
}
