/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { ViewProps } from 'react-native';
import * as React from 'react';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

const shimmerName = 'Shimmer';

const NativeShimmerView = ensureNativeComponent('MSFShimmerView');

/**
 * Shimmer Tokens are a 1:1 list of the native properties we can set on the native component
 */
export type ShimmerTokens = {
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
 * All of the base native view props, plus the props the native shimmer control needs to receive
 */
export type NativeShimmerViewProps = ViewProps & ShimmerTokens;

export type ShimmerProps = ViewProps;

interface ShimmerType {
  props: ShimmerProps;
  slotProps: { root: NativeShimmerViewProps };
  tokens: ShimmerTokens;
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
    root: buildProps(tokens => ({ ...tokens }), []),
  },
  slots: { root: NativeShimmerView },
  render: (props: NativeShimmerViewProps, useSlots: UseSlots<ShimmerType>) => {
    const Root = useSlots(props).root;
    return (rest: NativeShimmerViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});

export default Shimmer;
