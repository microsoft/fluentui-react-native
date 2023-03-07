import type { PressableProps } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

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
  onHoverIn?: (event: any) => any;

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?: (event: any) => any;
};

/**
 * PressablePropsExtended includes all the desktop specific types unique to IViewProps, along with the Pressable event handlers
 */
export type PressablePropsExtended = Omit<IViewProps, keyof PressableProps> &
  PressableProps &
  PressableHoverProps &
  PressableFocusProps &
  PressablePressProps;
