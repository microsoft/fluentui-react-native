import type { AnimatableNumericValue } from 'react-native';

import type { ICalloutProps, ICalloutTokens } from '@fluentui-react-native/callout';

export const menuCalloutName = 'MenuCallout';

// Support for anchorRect and beakWidth will come at a later time.
// Omitting dismissBehaviors as it doesn't seem to make sense as a token
export type MenuCalloutTokens =
  | Omit<ICalloutTokens, 'anchorRect' | 'beakWidth' | 'dismissBehaviors'> & {
      /**
       * The token for the corner radius for the Modal MenuPopover
       * @platform android macos
       */
      borderRadius?: AnimatableNumericValue | string;

      /**
       * Shadown elevation token for the Modal MenuPopover
       * @platform android
       */
      elevation?: number;
    };

export type MenuCalloutProps = ICalloutProps & { tokens: MenuCalloutTokens };
