/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { ViewProps } from 'react-native';
import { IViewProps } from '@fluentui-react-native/adapters';
import * as React from 'react';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const shimmerName = 'Shimmer';

const NativeShimmerView = ensureNativeComponent('MSFShimmerView');

/**
 * ViewProps props, based off of the standard react-native ViewProps with some new extensions
 */
export type NativeShimmerViewProps<TBase = IViewProps> = TBase & {
  /**
   * The alpha value of the center of the gradient in the animation
   */
  shimmerAlpha?: number;

  /**
   * The width of the gradient in the animation
   */
  shimmerWidth?: number;

  /**
   * Angle of the direction of the gradient, in radian. 0 means horizontal, Pi/2 means vertical.
   */
  shimmerAngle?: number;

  /**
   * Speed of the animation, in point/seconds.
   */
  shimmerSpeed?: number;

  /**
   * Delay between the end of a shimmering animation and the beginning of the next one, in seconds
   */
  shimmerDelay?: number;

  /**
   * Color to tint the shimmer boxes. Defaults to the Fabric default color.
   */
  viewTintColor?: string;

  /**
   * Corner radius on each view.
   */
  cornerRadius?: number;
};

/**
 * Shimmer Token is a flat list of all the properties we can set on the native view
 */
export type ShimmerToken = NativeShimmerViewProps;

interface ShimmerType {
  props: ViewProps;
  slotProps: { root: NativeShimmerViewProps };
  tokens: ShimmerToken;
}

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  tokens: [
    {
      shimmerAlpha: 0.4,
      shimmerWidth: 180,
      shimmerAngle: -(Math.PI / 45.0),
      shimmerSpeed: 350,
      shimmerDelay: 0.4,
      viewTintColor: 'rgb(241,241,241)',
      cornerRadius: 4,
    },
    shimmerName,
  ],
  slotProps: {
    root: buildProps<NativeShimmerViewProps, ShimmerToken>(
      (tokens: ShimmerToken) => ({
        shimmerAlpha: tokens.shimmerAlpha,
        shimmerWidth: tokens.shimmerWidth,
        shimmerAngle: tokens.shimmerAngle,
        shimmerSpeed: tokens.shimmerSpeed,
        shimmerDelay: tokens.shimmerDelay,
        viewTintColor: tokens.viewTintColor,
        cornerRadius: tokens.cornerRadius,
      }),
      ['shimmerAlpha', 'shimmerWidth', 'shimmerAngle', 'shimmerSpeed', 'shimmerDelay', 'viewTintColor', 'cornerRadius'],
    ),
  },
  slots: { root: NativeShimmerView },
  render: (props: NativeShimmerViewProps, useSlots: UseSlots<ShimmerType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeShimmerViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});

export default Shimmer;
