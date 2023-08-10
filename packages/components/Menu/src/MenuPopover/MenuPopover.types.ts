import type { IViewProps } from '@fluentui-react-native/adapters';
import type { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';
import type { VibrancyViewProps } from '@fluentui-react-native/vibrancy-view';

export const menuPopoverName = 'MenuPopover';

// Support for anchorRect and beakWidth will come at a later time.
// Omitting dismissBehaviors as it doesn't seem to make sense as a token
export type MenuPopoverTokens =
  | Omit<ICalloutTokens, 'anchorRect' | 'beakWidth' | 'dismissBehaviors'> & {
      /**
       * Shadow elevation for the Modal MenuPopover
       * @platform android
       */
      elevation?: number;
    };

export type MenuPopoverProps = ICalloutProps;

export interface MenuPopoverState {
  props: ICalloutProps;
  innerView: IViewProps;
  vibrancyView: VibrancyViewProps;
}
