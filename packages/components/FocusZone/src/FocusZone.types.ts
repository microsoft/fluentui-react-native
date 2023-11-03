import type * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { IFocusable } from '@fluentui-react-native/interactive-hooks';
import type { IRenderData } from '@uifabricshared/foundation-composable';

export const focusZoneName = 'FocusZone';

export interface FocusZoneState {}

export type FocusZoneProps = React.PropsWithChildren<{
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
   * @platform win32
   * By default, pressing Tab within a FocusZone moves focus out of the FocusZone.
   * This prop allows you to change that behavior.
   *
   * "None" : Default
   * "NavigateWrap" : Tab allowed within FZ with circular navigation behavior
   * "NavigateStopAtEnds" : Tab allowed within FZ and stops at ends
   * "Normal" : Tab allowed within FZ, and focus is not trapped. Tabbing at the last element bring you out of the FZ.
   *
   * Recommended Usage - Moving focus OUT of the FocusZone - Custom Key Handlers
   *      Example: Subscribe to key events. On the pressing of "Escape", move focus out of the FocusZone.
   *
   * Recommended Usage - Moving focus INTO the FocusZone
   *    Let's take a CardList, for example. If a user is navigating through elements of the List, we don't want
   *    focus to land within the FocusZone on initial focus. If it does, it will trap focus within the FocusZone and
   *    ruin the user's workflow.
   *    Instead, once focus lands on the parent of the FocusZone, implement a custom key handler that will enable
   *    the FocusZone.
   */
  tabKeyNavigation?: FocusZoneTabNavigation;

  /**
   * Callback called when “focus” event triggered in FocusZone
   */
  onFocus?: (e?: any) => void;

  /**
   * Allow consumers to pass in Style props
   */
  style?: ViewStyle;
}>;

export interface NativeProps extends Omit<FocusZoneProps, 'isCircularNavigation'> {
  navigateAtEnd?: NavigateAtEnd;
  tabKeyNavigation?: FocusZoneTabNavigation;
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

export type FocusZoneTabNavigation =
  | 'None' /* Tab navigates you out of the FocusZone. This is Default */
  | 'NavigateWrap' /* Navigate the FZ with Tab. Circular navigation at ends */
  | 'NavigateStopAtEnds' /* Navigate the FZ with Tab. Stop navigation at ends */
  | 'Normal'; /* Navigate the FZ with Tab. Don't trap focus, tabbing at ends moves you out */

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
