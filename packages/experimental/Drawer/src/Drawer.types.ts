import type { Animated, ColorValue, FlexAlignType, ModalProps, TouchableWithoutFeedbackProps, ViewProps } from 'react-native';

import type { InteractionEvent, PressableFocusProps } from '@fluentui-react-native/interactive-hooks';

export const DrawerName = 'Drawer';

/**
 * Specifies the possible position of the Drawer.
 */
export type DrawerBehaviorType = 'bottom' | 'leftSlideOver' | 'rightSlideOver' | 'bottomSlideOver';

export interface DrawerTokens {
  /**
   * The color of the scrim.
   * */
  scrimColor?: ColorValue;

  /**
   * The opacity of the scrim.
   * */
  scrimOpacity?: number;

  /**
   * Width of the handle.
   */
  handleWidth?: number;

  /**
   * Height of the handle.
   */
  handleHeight?: number;

  /**
   * The background color of the handle.
   * */
  handleBackgroundColor?: ColorValue;

  /**
   * The corner radius of the handle.
   * */
  handleCornerRadius?: number;

  /**
   * The top margin of the handle.
   *  */
  handleMarginTop?: number;

  /**
   * The bottom margin of the handle.
   * */

  handleMarginBottom?: number;

  /**
   * The start margin of the handle.
   * */

  handleMarginStart?: number;

  /**
   * The end margin of the handle.
   * */

  handleMarginEnd?: number;

  /**
   * The flex alignment of the handle.
   * */
  handleAlignment?: FlexAlignType;

  /**
   * The background for drawer
   * */

  drawerBackgroundColor?: ColorValue;

  /**
   * The corner radius of the Drawer
   * @default 0
   * */
  drawerCornerRadius?: number;

  /**
   * The elevation of the Drawer
   * @default 5
   * @platform android
   * */
  drawerElevation?: number;

  /**
   * The width of the Drawer
   * Note: Only applicable when position is 'left' or 'right'
   * @default '100%'
   * */
  width?: number | string;

  /**
   * The height of the Drawer
   * Note: Only applicable when position is 'bottom'
   * @default '40%'
   * */
  height?: number | string;

  /**
   * The shadow color of the Drawer
   * @platform iOS
   * */
  shadowColor?: ColorValue;

  /**
   * The shadow offset of the Drawer
   * @platform iOS
   * */
  shadowOffset?: { width: number; height: number };

  /**
   * The shadow opacity of the Drawer
   * @platform iOS
   * */
  shadowOpacity?: number;

  /**
   * The shadow radius of the Drawer
   * @platform iOS
   * */

  shadowRadius?: number;
  /**
   * The behavior of the Drawer
   * @default 'leftSlideOver'
   * */
  behavior?: DrawerBehaviorType;

  /**
   * Positions/Behaviours of the Drawer
   */

  leftSlideOver?: DrawerTokens;
  rightSlideOver?: DrawerTokens;
  bottomSlideOver?: DrawerTokens;
  bottom?: DrawerTokens;

  /**
   * Coordinate position of the Drawer
   */

  leftPosition?: number;
  rightPosition?: number;
  bottomPosition?: number;
  topPosition?: number;
}

export interface DrawerProps extends PressableFocusProps {
  /*
   ** An accessibility label for screen readers. Set on the text Drawer.
   */
  accessibilityLabel?: string;

  /**
   * Visibility of the Drawer
   */
  visible?: boolean;

  /**
   * Callback when the Drawer is closed
   * */
  onClose?: (e: InteractionEvent) => void;

  /**
   * Callback when the Drawer is opened
   * */
  onOpen?: (e: InteractionEvent) => void;

  /**
   * Whether the Drawer is open on mount
   */
  defaultOpen?: boolean;

  /**
   * Callback when the scrim is clicked
   * */
  onScrimClick?: (e: InteractionEvent) => void;

  /**
   * The content of the Drawer
   * */
  children?: React.ReactNode;

  /**
   * The behavior of the Drawer
   * @default 'leftSlideOver'
   * */
  behavior?: DrawerBehaviorType;

  /**
   * The width of the Drawer
   * Animation configuration for the Drawer
   * */
  animationConfig?: {
    animatedOpacity: Animated.AnimatedInterpolation;
    animatedStyle: { transform: { translateX: Animated.AnimatedInterpolation }[] | { translateY: Animated.AnimatedInterpolation }[] };
  };
}

export interface DrawerInfo {
  props: DrawerProps;
}

export interface DrawerSlotProps {
  modal: ModalProps;
  scrim: TouchableWithoutFeedbackProps;
  scrimContent: Animated.AnimatedProps<ViewProps>;
  content: Animated.AnimatedProps<ViewProps>;
  handle: ViewProps;
}

export interface DrawerType {
  props: DrawerProps;
  tokens: DrawerTokens;
  slotProps: DrawerSlotProps;
}
