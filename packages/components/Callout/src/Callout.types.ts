import * as React from 'react';
import * as ReactNative from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';

export const calloutName = 'Callout';

/**
 * Properties and Tokens for fabric native Callout
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

export interface ICalloutTokens extends IBackgroundColorTokens, IBorderTokens {
  anchorRect?: ReactNative.ScreenRect;
  beakWidth?: number;
  directionalHint?: DirectionalHint;
  gapSpace?: number;
  minPadding?: number;
}

export interface ICalloutProps extends ICalloutTokens {
  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Callback invoked when the callout has been dismissed.
   */
  onDismiss?: () => void;

  /**
   * Callback invoked when the callout has been shown.
   */
  onShow?: () => void;

  /**
   * Target node the callout uses for relative positioning; the anchor of the callout.
   */
  target?: React.RefObject<React.Component>;
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
