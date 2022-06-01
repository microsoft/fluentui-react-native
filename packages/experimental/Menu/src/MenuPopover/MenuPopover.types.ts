import { DirectionalHint, DismissBehaviors, ICalloutProps } from '@fluentui-react-native/callout';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { AccessibilityRole } from 'react-native';

export const menuPopoverName = 'MenuPopover';

export type MenuPopoverProps = ICalloutProps;

export interface MenuPopoverState {
  accessibilityRole: AccessibilityRole;
  directionalHint?: DirectionalHint;
  dismissBehaviors: DismissBehaviors[];
  doNotTakePointerCapture: boolean;
  onDismiss: () => void;
  onMouseEnter: () => void;
  onMouseLeave?: (e: InteractionEvent) => void;
  setInitialFocus: boolean;
  triggerRef: React.RefObject<React.Component>;
}
