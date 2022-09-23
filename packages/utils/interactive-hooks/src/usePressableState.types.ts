import { IViewProps } from '@fluentui-react-native/adapters';
import { HostComponent, NativeSyntheticEvent, PressableProps } from 'react-native';

// GH #1035: Temporarily copy the types needed for "MouseEvent"
// while we wait for the new DefinitelyTyped package to land.
// [
export interface NativeUIEvent {
  /**
   * Returns a long with details about the event, depending on the event type.
   */
  readonly detail: number;
}

export interface NativeMouseEvent extends NativeUIEvent {
  /**
   * The X coordinate of the mouse pointer in global (screen) coordinates.
   */
  readonly screenX: number;
  /**
   * The Y coordinate of the mouse pointer in global (screen) coordinates.
   */
  readonly screenY: number;
  /**
   * The X coordinate of the mouse pointer relative to the whole document.
   */
  readonly pageX: number;
  /**
   * The Y coordinate of the mouse pointer relative to the whole document.
   */
  readonly pageY: number;
  /**
   * The X coordinate of the mouse pointer in local (DOM content) coordinates.
   */
  readonly clientX: number;
  /**
   * The Y coordinate of the mouse pointer in local (DOM content) coordinates.
   */
  readonly clientY: number;
  /**
   * Alias for NativeMouseEvent.clientX
   */
  readonly x: number;
  /**
   * Alias for NativeMouseEvent.clientY
   */
  readonly y: number;
  /**
   * Returns true if the control key was down when the mouse event was fired.
   */
  readonly ctrlKey: boolean;
  /**
   * Returns true if the shift key was down when the mouse event was fired.
   */
  readonly shiftKey: boolean;
  /**
   * Returns true if the alt key was down when the mouse event was fired.
   */
  readonly altKey: boolean;
  /**
   * Returns true if the meta key was down when the mouse event was fired.
   */
  readonly metaKey: boolean;
  /**
   * The button number that was pressed (if applicable) when the mouse event was fired.
   */
  readonly button: number;
  /**
   * The buttons being depressed (if any) when the mouse event was fired.
   */
  readonly buttons: number;
  /**
   * The secondary target for the event, if there is one.
   */
  readonly relatedTarget: null | number | React.ElementRef<HostComponent<unknown>>;
  // offset is proposed: https://drafts.csswg.org/cssom-view/#extensions-to-the-mouseevent-interface
  /**
   * The X coordinate of the mouse pointer between that event and the padding edge of the target node
   */
  readonly offsetX: number;
  /**
   * The Y coordinate of the mouse pointer between that event and the padding edge of the target node
   */
  readonly offsetY: number;
}

export interface MouseEvent extends NativeSyntheticEvent<NativeMouseEvent> {}

// ]

export type PressState = {
  pressed?: boolean;
};

export type FocusState = {
  focused?: boolean;
};

export type HoverState = {
  hovered?: boolean;
};

export type PressableState = PressState & FocusState & HoverState;

export type PressablePressProps = {
  /**
   * Duration (in milliseconds) from `onPressIn` before `onLongPress` is called.
   */
  delayLongPress?: PressableProps['delayLongPress'];

  /**
   * Called when a press gestute has been triggered.
   */
  onPress?: PressableProps['onPress'];

  /**
   * Called when the press is activated to provide visual feedback.
   */
  onPressIn?: PressableProps['onPressIn'];

  /**
   * Called when the press is deactivated to undo visual feedback.
   */
  onPressOut?: PressableProps['onPressOut'];

  /**
   * Called when a long press gesture has been triggered.
   */
  onLongPress?: PressableProps['onLongPress'];
};

export type PressableFocusProps = {
  /**
   * Called after the element loses focus.
   */
  onBlur?: (event: any) => any;

  /**
   * Called after the element is focused.
   */
  onFocus?: (event: any) => any;
};

export type PressableHoverProps = {
  /**
   * Duration to wait after hover in before calling `onHoverIn`.
   */
  delayHoverIn?: number;

  /**
   * Duration to wait after hover out before calling `onHoverOut`.
   */
  delayHoverOut?: number;

  /**
   * Called when the hover is activated to provide visual feedback.
   */
  onHoverIn?: (event: MouseEvent) => any;

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?: (event: MouseEvent) => any;
};

/**
 * PressablePropsExtended includes all the desktop specific types unique to IViewProps, along with the Pressable event handlers
 */
export type PressablePropsExtended = Omit<IViewProps, keyof PressableProps> &
  PressableProps &
  PressableHoverProps &
  PressableFocusProps &
  PressablePressProps;
