import { IViewProps } from '@fluentui-react-native/adapters';
import { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';

export const menuPopoverName = 'MenuPopover';

// Support for anchorRect and beakWidth will come at a later time.
// Omitting dismissBehaviors as it doesn't seem to make sense as a token
export type MenuPopoverTokens = Omit<ICalloutTokens, 'anchorRect' | 'beakWidth' | 'dismissBehaviors'>;

export type MenuPopoverProps = ICalloutProps;

export interface MenuPopoverState {
  props: ICalloutProps;
  innerView: IViewProps;
}
