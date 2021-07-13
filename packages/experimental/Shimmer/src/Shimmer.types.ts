import { SvgProps, ImageProps } from 'react-native-svg';
import { ImageURISource, ColorValue } from 'react-native';

export const shimmerName = 'Shimmer';

/**
 * Specifies the possible type of the shimmer elements: Rect, Circle.
 * Required when building more than one element at a time.
 */
export type ShimmerElementType = 'rect' | 'circle';

/**
 * Represents the shimmer element -- TODO: make rect and circle types
 */
export interface ShimmerElement {
  /**
   * Specifies the rect shimmer border radius; no-op for circle element
   * @defaultValue '0'
   */
  borderRadius?: number;

  /**
   * Specifies the shimmer view height. For circle element type, height is divided by 2 to get the radius for Svg
   * @defaultValue '100'
   */
  height?: number;

  /**
   * Type of the shimmer element
   */
  type: ShimmerElementType;

  /**
   * Specifies the element width; no-op for circle element
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
   * Specifies the gradient angle, value should be anywhere between -1 and 1 TODO: Clarify units
   * -1 to 1 maps to 90 degrees horizontally to ≈ 120 degrees
   * @defaultValue '0'
   */
  angle?: number;

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

  // TODO: Clarify why the gradient default is 0.7 or why the gradient should be translucent.
  // neither seem necessary.
  /**
   * Specifies the gradient opacity
   * @defaultValue '.7'
   */
  gradientOpacity?: number;

  /**
   * Gradient tint color
   * @defaultValue 'white'
   */
  gradientTintColor?: ColorValue;

  /**
   * Specifies the shimmer view height. For the circle element type, height is divided by 2 to get the radius for Svg
   * @defaultValue '100'
   */
  height?: number;

  /**
   * Shimmer element tint color; no-op for image based shimmer
   * @defaultValue 'E1E1E1' for light mode, '404040' for dark mode
   */
  shimmerTintColor?: ColorValue;

  // TODO: we should set speed or time. we can offer speed or time, but distance is already dictated / redundant with delay

  /**
   * Specifies the distance traveled from starting position.
   * By default, the animation will animate from 0 to 30 over the course of 7000ms, since speed = distance / time, so
   * speed ≈ 0.004 dip/ms ?? (higher the speed, faster it moves).
   * @defaultValue '30'
   */
  toValue?: number;

  /**
   * Width of the shimmer wave
   * @defaultValue '200'
   */
  width?: number;
}

export interface ShimmerSlotProps extends ShimmerProps {
  root: SvgProps;
  image: ImageProps;
}

export interface ShimmerProps extends ShimmerTokens {
  /**
   * Array of ShimmerElement in a single view
   */
  elements?: Array<ShimmerElement>;

  /**
   * Image to be used as a shimmer element
   * @defaultValue 'null'
   */
  uri?: ImageURISource;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
