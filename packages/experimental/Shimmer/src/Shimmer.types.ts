import { SvgProps } from 'react-native-svg';
import { ViewProps } from 'react-native';
import { IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const shimmerName = 'Shimmer';

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
   * Note: The behavior of element intersections is undefined.  https://www.github.com/Microsoft/fluentui-react-native Issue #866
   */

  /**
   * The x-axis center of the circle element in the Shimmer relative to the origin [top-left, (0,0)].
   */
  cx: number;

  /**
   * The y-axis center of the circle element in the Shimmer relative to the origin [top-left, (0,0)].
   */
  cy: number;
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
   * Note: The behavior of element intersections is undefined.  https://www.github.com/Microsoft/fluentui-react-native Issue #866
   */

  /**
   * The x-axis position of the rect element's top-left corner in the Shimmer relative to the origin [top-left, (0,0)].
   */
  x: number;

  /**
   * The y-axis position of the rect element's top-left corner in the Shimmer relative to the origin [top-left, (0,0)].
   */
  y: number;
}

export type ShimmerElementTypes = ShimmerCircleElement | ShimmerRectElement;

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
   * Specifies the opacity of the shimmer color.
   * @defaultValue 1
   */
  shimmerColorOpacity?: number;

  /**
   * Specifies the opacity of the wave color.
   * @defaultValue 1
   */
  shimmerWaveColorOpacity?: number;

  /**
   * Color you see when the shimmer wave is not animating.
   *
   * Note: Needs to be changed to ColorValue. https://www.github.com/Microsoft/fluentui-react-native Issue #866
   *
   * @defaultValue theme.colors.bodyFrameDivider
   */
  shimmerColor?: string | number;

  /**
   * Defines the tip color of the wave which has a linear gradient.
   * from shimmerColor to shimmerWaveColor to shimmerColor.
   *
   * Note: Needs to be changed to ColorValue. https://www.github.com/Microsoft/fluentui-react-native Issue #866
   *
   * @defaultValue '#E1E1E1'
   */
  shimmerWaveColor?: string | number;

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
  elements?: Array<ShimmerElementTypes>;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
