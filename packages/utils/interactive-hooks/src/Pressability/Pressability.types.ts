import { RectOrSize } from './InternalTypes';
import { BlurEvent, FocusEvent, PressEvent, MouseEvent } from './CoreEventTypes';
import { ViewProps } from 'react-native';

export type PressabilityConfig = Readonly<{
  /**
   * Whether a press gesture can be interrupted by a parent gesture such as a
   * scroll event. Defaults to true.
   */
  cancelable?: boolean;

  /**
   * Whether to disable initialization of the press gesture.
   */
  disabled?: boolean;

  /**
   * Amount to extend the `VisualRect` by to create `HitRect`.
   */
  hitSlop?: ViewProps['hitSlop'];

  /**
   * Amount to extend the `HitRect` by to create `PressRect`.
   */
  pressRectOffset?: RectOrSize;

  /**
   * Whether to disable the systemm sound when `onPress` fires on Android.
   **/
  android_disableSound?: boolean;

  /**
   * Duration to wait after hover in before calling `onHoverIn`.
   */
  delayHoverIn?: number;

  /**
   * Duration to wait after hover out before calling `onHoverOut`.
   */
  delayHoverOut?: number;

  /**
   * Duration (in addition to `delayPressIn`) after which a press gesture is
   * considered a long press gesture. Defaults to 500 (milliseconds).
   */
  delayLongPress?: number;

  /**
   * Duration to wait after press down before calling `onPressIn`.
   */
  delayPressIn?: number;

  /**
   * Duration to wait after letting up before calling `onPressOut`.
   */
  delayPressOut?: number;

  /**
   * Called after the element loses focus.
   */
  onBlur?: (event: BlurEvent) => any;

  /**
   * Called after the element is focused.
   */
  onFocus?: (event: FocusEvent) => any;

  /**
   * Called when the hover is activated to provide visual feedback.
   */
  onHoverIn?: (event: MouseEvent) => any;

  /**
   * Called when the hover is deactivated to undo visual feedback.
   */
  onHoverOut?: (event: MouseEvent) => any;

  /**
   * Called when a long press gesture has been triggered.
   */
  onLongPress?: (event: PressEvent) => any;

  /**
   * Called when a press gestute has been triggered.
   */
  onPress?: (event: PressEvent) => any;

  /**
   * Called when the press is activated to provide visual feedback.
   */
  onPressIn?: (event: PressEvent) => any;

  /**
   * Called when the press location moves. (This should rarely be used.)
   */
  onPressMove?: (event: PressEvent) => any;

  /**
   * Called when the press is deactivated to undo visual feedback.
   */
  onPressOut?: (event: PressEvent) => any;
}>;

export type PressabilityEventHandlers = Readonly<{
  onBlur: (event: BlurEvent) => void;
  onClick: (event: PressEvent) => void;
  onFocus: (event: FocusEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onResponderGrant: (event: PressEvent) => void;
  onResponderMove: (event: PressEvent) => void;
  onResponderRelease: (event: PressEvent) => void;
  onResponderTerminate: (event: PressEvent) => void;
  onResponderTerminationRequest: () => boolean;
  onStartShouldSetResponder: () => boolean;
}>;
