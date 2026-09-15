import { Platform } from 'react-native';

import { useRootInputModality } from '@fluentui-react-native/design';
import { useOptionalSlot } from '@fluentui-react-native/framework-base';
import type { ComponentState, OptionalSlot } from '@fluentui-react-native/framework-base';

import { FocusVisual } from '../primitives/focus-visual/focus-visual';

export interface FocusVisualsOptions {
  focused: boolean;
  /**
   * Defaults to true on Windows/macOS and false on other platforms, including Win32.
   */
  useSystemFocusRing?: boolean;
  /**
   * Show the custom ring whenever focused, even for pointer focus. This takes
   * precedence over the system-ring preference, but does not force focus.
   */
  alwaysVisible?: boolean;
}

export type FocusVisualsSlots = {
  FocusRing: OptionalSlot<typeof FocusVisual>;
};

export type FocusVisualsState = ComponentState<FocusVisualsSlots> & {
  enableFocusRing: boolean;
};

/**
 * Chooses the native or custom focus visual. Apply custom ring geometry and
 * theme colors in the styling phase with applyFocusRingStyles.
 */
export function useFocusVisuals({ focused, useSystemFocusRing, alwaysVisible = false }: FocusVisualsOptions): FocusVisualsState {
  const enableFocusRing = !alwaysVisible && (useSystemFocusRing ?? (Platform.OS === 'windows' || Platform.OS === 'macos'));
  const inputModality = useRootInputModality(focused && !enableFocusRing && !alwaysVisible);
  const FocusRing = useOptionalSlot(
    FocusVisual,
    enableFocusRing ? null : { visible: focused && (alwaysVisible || inputModality === 'keyboard') },
  );

  return { FocusRing, enableFocusRing };
}
