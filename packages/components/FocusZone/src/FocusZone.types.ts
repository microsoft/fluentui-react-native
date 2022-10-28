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
   ** Defines which arrow keys to react to
   */
  focusZoneDirection?: FocusZoneDirection;

  /**
   * Disables the FocusZone, with slightly different behavior on macOS and win32.
   * On win32, the FocusZone will not be tabbable and keyboard navigation will be disabled.
   * on macOS, the FocusZone will "pass through" events, and the children will respond as if there was no FocusZone.
   */
  disabled?: boolean;

  /**
   * Circular Navigation prop
   * @platform win32
   */
  isCircularNavigation?: boolean;

  /**
   * Allows for 2D navigation. This navigation strategy takes into account the position of elements
   * on screen, and navigates in the direction the user selects to the nearest element.
   * @platform win32
   */
  use2DNavigation?: boolean;

  /**
   * Moves focus between all focusable views, rather than just key views.
   *
   * On macOS, not every focusable view is a key view (i.e: we can press Tab to move focus to it).
   * Rather, there is a system preference to toggle which views are in the key view loop.
   * This prop allows you to focus on all focusable views, rather than just key views.
   * For more info, see https://microsoft.github.io/apple-ux-guide/KeyboardFocus.html
   * @platform macOS
   */
  forceFocusMacOS?: boolean;

  /**
   * Callback called when “focus” event triggered in FocusZone
   */
  onFocus?: (e?: any) => void;
}

// Props on JS FocusZone that don't exist in the native module
interface NonNativeProps {
  isCircularNavigation: FocusZoneProps['isCircularNavigation'];
  forceFocusMacOS: FocusZoneProps['forceFocusMacOS'];
}
export interface NativeProps extends Exclude<FocusZoneProps, NonNativeProps> {
  navigateAtEnd?: NavigateAtEnd; // win32 only
  forceFocus?: boolean; // macOS only
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
