import { getInteractionColor } from '../../color-lib/interaction';
import type { ColorMode, InteractionColorDiagnostic, InteractionColorState } from '../../color-lib/types';
import { getInteractionCompositing, getInteractionDirection, INTERACTIVE_COLOR_TOKENS } from '../../flex/colors/interactiveTokens';
import type { InteractiveColorToken } from '../../flex/colors/interactiveTokens';
import type { InteractiveColorOverrides, SemanticColorTokenValues } from '../../flex/tokens.types';
import type { ColorTone } from '../../types/appearance.types';

export interface InteractionAuditDiagnostic extends InteractionColorDiagnostic {
  readonly token: InteractiveColorToken;
}

export interface InteractionOverridesResult {
  readonly overrides: InteractiveColorOverrides;
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
  const overrides: InteractiveColorOverrides = {};
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
