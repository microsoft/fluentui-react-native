import * as React from 'react';
import { ScreenRect, ViewStyle } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';

export const calloutName = 'Callout';

/**
 * Properties and Tokens for FluentUI React Native Callout
 */

export type DirectionalHint =
  | 'leftTopEdge'
  | 'leftCenter'
  | 'leftBottomEdge'
  | 'topLeftEdge'
  | 'topAutoEdge'
  | 'topCenter'
  | 'topRightEdge'
  | 'rightTopEdge'
  | 'rightCenter'
  | 'rightBottomEdge'
  | 'bottonLeftEdge'
  | 'bottomAutoEdge'
  | 'bottomCenter'
  | 'bottomRightEdge';

export interface RestoreFocusEvent {
  nativeEvent: {
    /**
     * containsFocus is true if the Callout had focus while being dismissed.
     */
    containsFocus: boolean;
  };
}

interface OmittedBorderTokens {
  borderRadius?: number | string;
  borderStyle?: ViewStyle['borderStyle'];
}

type CalloutBorderTokens = Omit<IBorderTokens, keyof OmittedBorderTokens>;

export interface ICalloutTokens extends IBackgroundColorTokens, CalloutBorderTokens {
  /**
   * AnchorRect arbitrary anchor rectangle; coordinate system is in DIPs, relative
   * to the React surface origin.
   */
  anchorRect?: ScreenRect;

  /**
   * Width of the beak on the Callout indicating its anchor.
   */
  beakWidth?: number;

  /**
   * Defines the suggested drop direction and alignment for the Callout to use, relative
   * to the anchor information.
   */
  directionalHint?: DirectionalHint;

  /**
   * Defines the size of the gap between the anchor and the Callout.  Not used if
   * no anchor information is provided.
   */
  gapSpace?: number;

  /**
   * Defines a maximum height for the Callout.
   */
  maxHeight?: number | string;

  /**
   * Defines a maximum width for the Callout.
   */
  maxWidth?: number | string;

  /**
   * Defines the minimum padding between the Callout and the display edges.
   */
  minPadding?: number;
}

export interface ICalloutProps extends ICalloutTokens {
  /*
   * Used by screen readers to inform the user about the control.
   */
  accessibilityLabel?: string;

  /*
   * A string that should be announced when the callout is shown.
   */
  accessibilityOnShowAnnouncement?: string;

  /*
   * Used by screen readers to inform the user about the purpose of the control.
   */
  accessibilityRole?: string;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Adds a beak to the Callout, pointing to the anchor target.
   * Notable Win32 limitation: Beak rendering currently limits the border width to its default, and the
   * border width prop will not be honored.
   */
  isBeakVisible?: boolean;

  /**
   * Callback invoked when the callout has been dismissed.
   */
  onDismiss?: () => void;

  /**
   * Callback invoked during callout dismissal; if set, focus will not be restored by the callout and onRestoreFocus must
   * result in focus being moved to the appropriate focusable target.
   *
   * The callee should carefully consider their scenarios to avoid dropping focus, or inappropriately
   * moving focus from another component.  Focus is not guaranteed to have entered the React-Native surface at all, and
   * this callback is most appropriate for components strictly controlling focus.
   *
   * restoreFocusEvent.nativeEvent.containsFocus is true if the Callout had focus while being dismissed.
   */
  onRestoreFocus?: (restoreFocusEvent: RestoreFocusEvent) => void;

  /**
   * Callback invoked when the callout has been shown.
   */
  onShow?: () => void;

  /**
   * If true then the callout will attempt to focus the first focusable element that it contains.
   * If it doesn't find an element, no focus will be set. This means that it's the contents responsibility
   * to either set focus or have focusable items.
   */
  setInitialFocus?: boolean;

  /**
   * Target node the callout uses for relative positioning; the anchor of the callout.
   * A ref is the typical usage; certain components may proffer a string as an anchor target, such as
   * anchoring to a point inside the component.
   */
  target?: React.RefObject<React.Component> | string;
}

export type ICalloutSlotProps = {
  root: ICalloutProps;
};

export type ICalloutRenderData = IRenderData<ICalloutSlotProps>;

export interface ICalloutType {
  props: ICalloutProps;
  slotProps: ICalloutSlotProps;
  tokens: ICalloutTokens;
}
