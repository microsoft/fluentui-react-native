import type { AccessibilityActionEvent, AccessibilityActionInfo } from 'react-native';

/** Props of an element that can declare accessibility actions. */
export interface ExpandActionProps {
  accessibilityActions?: readonly AccessibilityActionInfo[];
  onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
}

/**
 * Adds platform expand and collapse actions to an element that opens a popup. Only Win32 needs them to project expanded
 * state.
 */
export function withTriggerExpandActions<TProps extends ExpandActionProps>(
  props: TProps,
  _setExpanded: (expanded: boolean) => void,
): TProps {
  return props;
}
