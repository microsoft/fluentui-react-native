// import { SvgProps, ImageProps } from 'react-native-svg';
import { ImageURISource, ColorValue, ViewProps } from 'react-native';
import { ImageProps } from 'react-native-svg';

export const shimmerName = 'Shimmer';

/**
 * Specifies the possible type of the shimmer elements: Rect, Circle.
 * Required when building more than one element at a time.
 */
export type ShimmerElementType = 'rect' | 'circle';

/**
 * Represents the shimmer element
 */
export interface ShimmerElement {
  /**
   * Specifies the rect shimmer border radius, non-op for circle element
   * @defaultValue '0'
   */
  borderRadius?: number;

  /**
   * Specifies the shimmer view height. For circle element type, height is divided by 2 to get the radius for Svg
   * @defaultValue '100'
   */
  height?: number;

  /**
   * Type of the shimmer element ?? Why would we want this to be optional? or what's the default?
   */
  type: ShimmerElementType;

  /**
   * Specifies the element width, non-op for circle element
   * @defaultValue '200'
   */
  width?: number;

  /**
   * x-coordinate
   * @defaultValue '0'
   */
  xPos?: number;

  /**
   * y-coordinate
   * @defaultValue '0'
   */
  yPos?: number;
}

export interface ShimmerTokens {
  /**
   * Specifies the gradient angle, value should be anywhere between -1 and 1 (units? radians?)
   * -1 to 1 maps to 90 degrees horizontally to ≈ 120 degrees   ???????
   * @defaultValue '0'
   */
  angle?: number;

  // we just set speed or time. we can offer speed or time, but distance is already dictated / redundant with delay

  /**
   * Specifies the animation delay time in milliseconds
   * @defaultValue '0'
   */
  delay?: number;

  /**
   * Specifies the time required to traverse the control in milliseconds
   *
   * @defaultValue '7000'
   */
  duration?: number;

  /**
   * Specifies the gradient opacity, value should be less than 1 (actually? why?)
   * @defaultValue '.7'
   */
  gradientOpacity?: number;

  /**
   * Gradient tint color
   * @defaultValue 'white'
   */
  gradientTintColor?: ColorValue;

  /**
   * Shimmer element tint color, no-op for image based shimmer
   * @defaultValue 'E1E1E1' for light mode, '404040' for dark mode
   */
  shimmerTintColor?: ColorValue;

  /**
   * Specifies the distance traveled from starting position.
   * By default, the animation will animate from 0 to 30 over the course of 7000ms, since speed = distance / time, so
   * speed ≈ 0.004 dip/ms ?? (higher the speed, faster it moves).
   * @defaultValue '30'
   */
  toValue?: number;

  height?: number;
  /**
   * Width of the shimmer wave
   * @defaultValue '200'
   */
  width?: number;
}

export interface ShimmerSlotProps extends ShimmerProps {
  root: ViewProps;
  // shimmerWave: ShimmerTokens & ViewProps;
  // clippingMask: SvgProps;
  image: ImageProps;
}

export interface ShimmerProps extends ShimmerTokens {
  /**
   * Array of ShimmerElements representing the clipping mask
   */
  elements?: Array<ShimmerElement>;

  /**
   * Image to be used as a shimmer element
   */
  uri?: ImageURISource;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
