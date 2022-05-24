import { DismissBehaviors, ICalloutProps } from '@fluentui-react-native/callout';
import { AccessibilityRole } from 'react-native';

export const menuPopoverName = 'MenuPopover';

export type MenuPopoverProps = ICalloutProps;

export interface MenuPopoverState {
  accessibilityRole: AccessibilityRole;
  dismissBehaviors: DismissBehaviors[];
  onDismiss: () => void;
  setInitialFocus: boolean;
  triggerRef: React.RefObject<React.Component>;
}
