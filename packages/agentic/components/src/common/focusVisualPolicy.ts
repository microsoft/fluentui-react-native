import { createFocusVisualProps_unstable } from '../primitives/focus-visual/focus-visual';
import type { FocusVisualOptions, FocusVisualProps } from '../primitives/focus-visual/focus-visual.types';

// Set to false and reload the app to compare the retained custom rings.
export const focusVisualPolicy = {
  useSystemFocusVisuals: true,
};

export function getNativeFocusVisualProps(): { enableFocusRing: boolean } {
  return { enableFocusRing: focusVisualPolicy.useSystemFocusVisuals };
}

export function createFocusVisualProps(options: FocusVisualOptions): FocusVisualProps {
  return createFocusVisualProps_unstable({
    ...options,
    visible: options.visible && !focusVisualPolicy.useSystemFocusVisuals,
  });
}
