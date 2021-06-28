import { SvgProps, ImageProps } from 'react-native-svg';
import { ImageURISource, ColorValue } from 'react-native';

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
   * Type of the shimmer element
   */
  type?: ShimmerElementType;
  /**
   * Specifies the element width, non-op for circle element
   * @defaultValue '200'
   */
  width?: number;
  /**
   * Specifies the shimmer view height. For circle element type, height is divided by 2 to get the radius for Svg
   * @defaultValue '100'
   */
  height?: number;
  /**
   * Specifies the rect shimmer border radius, non-op for circle element
   * @defaultValue '0'
   */
  borderRadius?: number;
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
   * Specifies the distance traveled from starting position.
   * By default, the animation will animate from 0 to 30 over the course of 7000ms, since speed = distance / time, so
   * speed ≈ 0.004 (higher the speed, faster it moves).
   * @defaultValue '30'
   */
  toValue?: number;
  /**
   * Specifies the time required to travel a given distance in milliseconds
   *
   * @defaultValue '7000'
   */
  duration?: number;
  /**
   * Specifies the animation delay time in milliseconds
   * @defaultValue '0'
   */
  delay?: number;
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
   * Width of the shimmer view
   * @defaultValue '200'
   */
  width?: number;
  /**
   * Height of the shimmer view
   * @defaultValue '100'
   */
  height?: number;
  /**
   * Specifies the gradient angle, value should be anywhere between -1 and 1
   * -1 to 1 maps to 90 degrees horizontally to ≈ 120 degrees
   * @defaultValue '0'
   */
  angle?: number;
  /**
   * Specifies the gradient opacity, value should be less than 1
   * @defaultValue '.7'
   */
  gradientOpacity?: number;
}

export interface ShimmerSlotProps extends ShimmerProps {
  root: SvgProps;
  image: ImageProps;
}

export interface ShimmerProps extends ShimmerTokens {
  /**
   * Image to be used as a shimmer element
   * @defaultValue 'null'
   */
  uri?: ImageURISource;
  /**
   * Array of ShimmerElement in a single view
   */
  elements?: Array<ShimmerElement>;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
