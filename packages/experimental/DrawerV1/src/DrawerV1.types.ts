import type { Animated, ColorValue, FlexAlignType, ModalProps, TouchableWithoutFeedbackProps, ViewProps } from 'react-native';

import type { InteractionEvent, PressableFocusProps } from '@fluentui-react-native/interactive-hooks';
import { StyleProp } from '@fluentui-react-native/framework';

export const DrawerV1Name = 'DrawerV1';

export type DrawerPositionType = 'left' | 'right' | 'bottom';

export interface DrawerV1Tokens {
  /**
   * The color of the backdrop.
   * */
  backdropColor?: ColorValue;

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
   * */
  drawerElevation?: number;

  /**
   * The position of the Drawer
   * @default 'left'
   * */
  position?: 'left' | 'right' | 'bottom';

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
}

export interface DrawerV1Props extends PressableFocusProps {
  /*
   ** An accessibility label for screen readers. Set on the text DrawerV1.
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
   * Callback when the backdrop is clicked
   * */
  onBackdropClick?: (e: InteractionEvent) => void;

  /**
   * The content of the Drawer
   * */
  children?: React.ReactNode;

  /**
   * The position of the Drawer
   * @default 'left'
   * */
  position?: DrawerPositionType;

  /**
   * The width of the Drawer
   * Animation configuration for the Drawer
   * */
  animationConfig?: {
    animatedOpacity: Animated.AnimatedInterpolation;
    animatedStyle: { transform: { translateX: Animated.AnimatedInterpolation }[] | { translateY: Animated.AnimatedInterpolation }[] };
  };
}

export interface DrawerV1Info {
  props: DrawerV1Props;
}

export interface DrawerV1SlotProps {
  modal: ModalProps;
  backdrop: TouchableWithoutFeedbackProps;
  backdropContent: Animated.AnimatedProps<ViewProps>;
  content: Animated.AnimatedProps<ViewProps>;
  handle: ViewProps;
}

export interface DrawerV1Type {
  props: DrawerV1Props;
  tokens: DrawerV1Tokens;
  slotProps: DrawerV1SlotProps;
}
