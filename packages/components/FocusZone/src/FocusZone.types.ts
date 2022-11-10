import * as React from 'react';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const focusZoneName = 'FocusZone';

export interface FocusZoneState {}

export interface FocusZoneProps {
  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Optionally defines the initial tabbable element inside the FocusZone
   */
  defaultTabbableElement?: React.RefObject<React.Component>;

  /**
   ** Defines which arrows to react to
   */
  focusZoneDirection?: FocusZoneDirection;

  /**
   ** If set, the FocusZone will not be tabbable and keyboard navigation will be disabled
   */
  disabled?: boolean;

  /* Circular Navigation prop */
  isCircularNavigation?: boolean;

  /**
   *Allows for 2D navigation. This navigation strategy takes into account the position of elements
   on screen, and navigates in the direction the user selects to the nearest element.
   */
  use2DNavigation?: boolean;

  /**
   * Callback called when “focus” event triggered in FocusZone
   */
  onFocus?: (e?: any) => void;
}

export interface NativeProps extends Omit<FocusZoneProps, 'isCircularNavigation'> {
  navigateAtEnd?: NavigateAtEnd;
}

export type FocusZoneDirection =
  | 'bidirectional' /** React to all arrows. */
  | 'vertical' /** Only react to up/down arrows. */
  | 'horizontal' /** Only react to left/right arrows. */
  | 'none'; /** Doesn't respond to any arrow keys. */

export type NavigateAtEnd =
  | 'NavigateStopAtEnds' /* Focus will stay on the last element in the FocusZone. Only way to navigate out is Tab. For macOS, this is the only available option. */
  | 'NavigateWrap' /* Circular Navigation Functionality */
  | 'NavigateContinue'; /* At the last element of the FocusZone, focus will move to the first focusable element outside the FocusZone */

export interface FocusZoneTokens {}

export interface FocusZoneSlotProps {
  root: NativeProps;
}

export type FocusZoneRenderData = IRenderData<FocusZoneSlotProps, FocusZoneState>;

export interface FocusZoneType {
  props: FocusZoneProps;
  tokens: FocusZoneTokens;
  slotProps: FocusZoneSlotProps;
  state: FocusZoneState;
}
