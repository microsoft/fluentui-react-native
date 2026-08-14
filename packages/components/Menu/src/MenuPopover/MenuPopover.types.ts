import type { AnimatableNumericValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';

export const menuPopoverName = 'MenuPopover';

// Support for anchorRect and beakWidth will come at a later time.
// Omitting dismissBehaviors as it doesn't seem to make sense as a token
export type MenuPopoverTokens = Omit<ICalloutTokens, 'anchorRect' | 'beakWidth' | 'dismissBehaviors'> & {
  /**
   * The props for the corner radius for the Modal MenuPopover
   * @platform android macos
   */
  borderRadius?: AnimatableNumericValue | string;

  /**
   * Shadown elevation for the Modal MenuPopover
   * @platform android
   */
  elevation?: number;
};

// MenuPopover owns the desktop view extensions it uses; Callout stays limited to React Native ViewProps.
export type MenuPopoverProps = IViewProps & Omit<ICalloutProps, keyof IViewProps>;

export interface MenuPopoverState {
  props: MenuPopoverProps;
  innerView: IViewProps;
}
