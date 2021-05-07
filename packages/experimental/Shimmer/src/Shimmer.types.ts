import { SvgProps, RectProps, CircleProps, ImageProps } from 'react-native-svg';
import { ImageURISource } from 'react-native';

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
   * The final value for the animation to reach the end
   * @defaultValue '30'
   */
  toValue?: number;
  /**
   * The time it'll take for the ref to reach the toValue property in milliseconds
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
  gradientTintColor?: string;
  /**
   * Shimmer element tint color, no-op for image based shimmer
   * @defaultValue 'E1E1E1' for light mode, '404040' for dark mode
   */
  shimmerTintColor?: string;
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
   * Specifies the gradient angle, value should be less than 1
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
  slotProps: ShimmerSlotProps
  tokens: ShimmerTokens;
}


