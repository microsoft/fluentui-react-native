import type { AccessibilityActionEvent, AccessibilityActionInfo } from 'react-native';

import type { ExpandActionProps } from './triggerExpandActions';

// Win32 implements the UI Automation ExpandCollapse pattern, which carries `accessibilityState.expanded`, only for
// elements that declare these actions.
const expandActions: AccessibilityActionInfo[] = [
  { name: 'Expand' as AccessibilityActionInfo['name'] },
  { name: 'Collapse' as AccessibilityActionInfo['name'] },
];

/** Adds the Win32 expand and collapse actions to an element that opens a popup and routes them to its presence. */
export function withTriggerExpandActions<TProps extends ExpandActionProps>(
  props: TProps,
  setExpanded: (expanded: boolean) => void,
): TProps {
  const { accessibilityActions, onAccessibilityAction } = props;
  return {
    ...props,
    accessibilityActions: accessibilityActions ? [...expandActions, ...accessibilityActions] : expandActions,
    onAccessibilityAction: (event: AccessibilityActionEvent) => {
      const { actionName } = event.nativeEvent;
      if (actionName === 'Expand' || actionName === 'Collapse') {
        setExpanded(actionName === 'Expand');
      }
      onAccessibilityAction?.(event);
    },
  };
}
