import { IViewProps } from '@fluentui-react-native/adapters';
import { ICalloutProps } from '@fluentui-react-native/callout';

export const menuPopoverName = 'MenuPopover';

export type MenuPopoverProps = ICalloutProps;

export interface MenuPopoverState {
  props: ICalloutProps;
  innerView: IViewProps;
}
