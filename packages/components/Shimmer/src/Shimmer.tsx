/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { requireNativeComponent, processColor, ViewProps } from 'react-native';
import { IViewProps } from '@fluentui-react-native/adapters';
import * as React from 'react';

const shimmerName = 'Shimmer';

const NativeShimmerView = requireNativeComponent('MSFShimmerView');

/**
 * Appearance of the views that are shimmered
 */
export interface ShimmerViewAppearance {
  /**
   * Color to tint the shimmer boxes. Defaults to the Fabric default color.
   */
  tintColor?: number;

  /**
   * Corner radius on each view.
   */
  cornerRadius?: number;

  /**
   * Corner radius on each UILabel. Set to < 0 to disable and use default `cornerRadius`.
   */
  labelCornerRadius?: number;

  /**
   * usesTextHeightForLabels: True to enable shimmers to auto-adjust to font height for a UILabel -- this
   * will more accurately reflect the text in the label rect rather than using the bounding box. `labelHeight`
   * will take precedence over this property.
   */
  usesTextHeightForLabels?: boolean;

  /**
   * If greater than 0, a fixed height to use for all UILabels. This will take precedence
   * over `usesTextHeightForLabels`. Set to less than 0 to disable.
   */
  labelHeight?: number;
}

/**
 * Appearance of the shimmer itself (the animation appearance)
 */
export interface ShimmerAppearance {
  alpha?: number;
  width?: number;

  /**
   * Angle of the direction of the gradient, in radian. 0 means horizontal, Pi/2 means vertical.
   */
  angle?: number;

  /**
   * Speed of the animation, in point/seconds.
   */
  speed?: number;

  /**
   * Delay between the end of a shimmering animation and the beginning of the next one, in seconds
   */
  delay?: number;
}

/**
 * ViewProps props, based off of the standard react-native ViewProps with some new extensions
 */
export type NativeShimmerViewProps<TBase = IViewProps> = TBase & {
  /**
   * Appearance of the views that are shimmered. If not passed, the default will be used.
   */
  appearance?: ShimmerViewAppearance;

  /**
   * Appearance of the shimmer itself (the animation appearance)
   */
  shimmerAppearance?: ShimmerAppearance;
};

/**
 * Shimmer Token is a flat list of all the properties we can set on the native view
 */
export type ShimmerToken = ShimmerAppearance & ShimmerViewAppearance;

interface ShimmerType {
  props: ViewProps;
  slotProps: { root: NativeShimmerViewProps };
  tokens: ShimmerToken;
}

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  tokens: [
    ({
      tintColor: processColor('#F1F1F1'),
      cornerRadius: 4,
      labelCornerRadius: 2,
      usesTextHeightForLabels: false,
      labelHeight: 11,
      alpha: 0.4,
      width: 180,
      angle: -(Math.PI / 45.0),
      speed: 350,
      delay: 0.4
    }),
    shimmerName,
  ],
  slotProps: {
    root: buildProps<NativeShimmerViewProps, ShimmerToken>(
      (tokens: ShimmerToken) => ({
        appearance: {
          tintColor: tokens.tintColor,
          cornerRadius: tokens.cornerRadius,
          labelCornerRadius: tokens.labelCornerRadius,
          usesTextHeightForLabels: tokens.usesTextHeightForLabels,
          labelHeight: tokens.labelHeight,
        },
        shimmerAppearance: {
          alpha: tokens.alpha,
          width: tokens.width,
          angle: tokens.angle,
          speed: tokens.speed,
          delay: tokens.delay,
        },
      }),
    ),
  },
  slots: { root: NativeShimmerView },
  render: (props: NativeShimmerViewProps, useSlots: UseSlots<ShimmerType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeShimmerViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});

export default Shimmer;
