import { SvgProps } from 'react-native-svg';
import { ColorValue, ViewProps } from 'react-native';
import { IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const shimmerName = 'Shimmer';

/**
 * Specifies the possible types of the shimmer elements: Rect, Circle.
 * Required when building more than one element at a time.
 */
export type ShimmerElementType = 'rect' | 'circle';

/**
 * Properties necessary to define a circular Shimmer element.
 */
export interface ShimmerCircleElement {
  /**
   * Shimmer element type.
   */
  type: 'circle';

  /**
   * Radius of the circle element.
   * @defaultValue 12
   */
  radius?: number;

  /**
   * Note: cx and cy should be optional properties [or removed], with relative positioning being the default [or only] positioning mechanism.
   * Note: The behavior of element intersections is undefined.
   */

  /**
   * The x-axis center of the circle element in the Shimmer relative to the origin [top-left, (0,0)].
   *
   * @defaultValue 12
   */
  cx?: number;

  /**
   * The y-axis center of the circle element in the Shimmer relative to the origin [top-left, (0,0)].
   *
   * @defaultValue 12
   */
  cy?: number;
}

/**
 * Properties necessary to define a rectangular Shimmer element.
 */
export interface ShimmerRectElement {
  /**
   * Shimmer element type.
   */
  type: 'rect';

  /**
   * Width of the rect.
   * @defaultValue 100%
   */
  width?: number;

  /**
   * Height of the rect.
   * @defaultValue 16
   */
  height?: number;

  /**
   * Border radius for the x-axis of a rounded rect.
   * @defaultValue 0
   */
  borderRadiusX?: number;

  /**
   * Border radius for the y-axis of a rounded rect.
   * @defaultValue 0
   */
  borderRadiusY?: number;

  /**
   * Note: x and y should be optional properties [or removed], with relative positioning being the default [or only] positioning mechanism.
   * Note: The behavior of element intersections is undefined.
   */

  /**
   * The x-axis position of the rect element's top-left corner in the Shimmer relative to the origin [top-left, (0,0)].
   * @defaultValue 0
   */
  x: number;

  /**
   * The y-axis position of the rect element's top-left corner in the Shimmer relative to the origin [top-left, (0,0)].
   * @defaultValue 0
   */
  y: number;
}

export interface ShimmerTokens extends IBackgroundColorTokens {
  /**
   * Specifies the Shimmer effect angle in degrees (produced by a gradient)
   * @defaultValue 0
   */
  angle?: number;

  /**
   * Specifies the animation delay time in milliseconds
   * @defaultValue 0
   */
  delay?: number;

  /**
   * Specifies the time required to traverse the control in milliseconds
   *
   * @defaultValue 2000
   */
  duration?: number;

  /**
   * Specifies the gradient opacity.
   * @defaultValue 1
   */
  gradientOpacity?: number;

  /**
   * Color you see when the shimmer wave is not animating.
   * @defaultValue theme.colors.bodyFrameDivider
   */
  shimmerColor?: ColorValue;

  /**
   * Defines the tip color of the wave which has a linear gradient.
   * from shimmerColor to shimmerWaveColor to shimmerColor.
   * @defaultValue '#E1E1E1'
   */
  shimmerWaveColor?: ColorValue;

  /**
   * Width of the Shimmer wave.
   * @defaultValue '100%' of the 'width' property
   */
  shimmerWaveWidth?: number | string;
}

export interface ShimmerSlotProps extends ShimmerProps {
  root: SvgProps;
}

export interface ShimmerProps extends ViewProps, ShimmerTokens {
  /**
   * Shimmer shapes that define the masking effect of the Shimmer control.
   */
  elements?: Array<ShimmerCircleElement | ShimmerRectElement>;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
