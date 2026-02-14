import type { PressableProps, GestureResponderEvent, BlurEvent, MouseEvent } from 'react-native';

import usePressabilityBase from 'react-native/Libraries/Pressability/usePressability';

export type Rect = {
  bottom?: number | null;
  left?: number | null;
  right?: number | null;
  top?: number | null;
};
export type RectOrSize = Rect | number;

type ConfigFromPressableProps = Pick<
  PressableProps,
  | 'cancelable'
  | 'disabled'
  | 'hitSlop'
  | 'android_disableSound'
  | 'delayHoverIn'
  | 'delayHoverOut'
  | 'delayLongPress'
  | 'onBlur'
  | 'onFocus'
  | 'onHoverIn'
  | 'onHoverOut'
  | 'onLongPress'
  | 'onPress'
  | 'onPressIn'
  | 'onPressOut'
  | 'pressRetentionOffset'
  | 'testOnly_pressed'
  | 'android_ripple'
>;

export type PressabilityConfig = ConfigFromPressableProps & {
  /**
   * Amount to extend the `HitRect` by to create `PressRect`.
   */
  pressRectOffset?: RectOrSize;

  /**
   * Duration to wait after press down before calling `onPressIn`.
   */
  delayPressIn?: number;

  /**
   * Duration to wait after letting up before calling `onPressOut`.
   */
  delayPressOut?: number;

  /**
   * Minimum duration to wait between calling `onPressIn` and `onPressOut`.
   */
  minPressDuration?: number;

  /**
   * Called when the press location moves. (This should rarely be used.)
   */
  onPressMove?: ((event: GestureResponderEvent) => void) | null;

  /**
   * Whether to prevent any other native components from becoming responder
   * while this pressable is responder.
   */
  blockNativeResponder?: boolean;
};

export type EventHandlers = {
  onBlur: (event: BlurEvent) => void;
  onClick: (event: GestureResponderEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onPointerEnter?: (event: PointerEvent) => void;
  onPointerLeave?: (event: PointerEvent) => void;
  onResponderGrant: (event: GestureResponderEvent) => void | boolean;
  onResponderMove: (event: GestureResponderEvent) => void;
  onResponderRelease: (event: GestureResponderEvent) => void;
  onResponderTerminate: (event: GestureResponderEvent) => void;
  onResponderTerminationRequest: () => boolean;
  onStartShouldSetResponder: () => boolean;
};

/**
 * Create a typed wrapper around the internal usePressability hook since the types are still in flow
 * for that file.
 * @param config pressability configuration options, replicated from internal usePressability hook.
 * @returns event handlers for the pressable component or null if config is null.
 */
export function usePressability(config: PressabilityConfig | null): EventHandlers | null {
  return usePressabilityBase(config);
}
