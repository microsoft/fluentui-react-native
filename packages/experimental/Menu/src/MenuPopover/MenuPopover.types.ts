import type { IViewProps } from '@fluentui-react-native/adapters';
import { DismissBehaviors } from '@fluentui-react-native/callout';

export const menuPopoverName = 'MenuPopover';

export interface MenuPopoverProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuPopoverState {
  dismissBehaviors: DismissBehaviors[];
  onDismiss: () => void;
  triggerRef: React.RefObject<React.Component>;
}
