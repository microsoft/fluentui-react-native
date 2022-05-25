import type { IViewProps } from '@fluentui-react-native/adapters';
import { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';

export const menuPopoverName = 'MenuPopover';

export interface MenuPopoverProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuPopoverState {
  directionalHint?: DirectionalHint;
  dismissBehaviors: DismissBehaviors[];
  doNotTakePointerCapture: boolean;
  onDismiss: () => void;
  setInitialFocus: boolean;
  triggerRef: React.RefObject<React.Component>;
}
