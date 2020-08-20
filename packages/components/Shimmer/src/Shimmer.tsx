/** @jsx withSlots */
import { compose, UseSlots, buildProps, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { requireNativeComponent } from 'react-native';
import { IViewProps } from '@fluentui-react-native/adapters';
import * as React from 'react';

const shimmerName = 'Shimmer';

const NativeShimmerView = requireNativeComponent('MSFShimmerView');

export interface IShimmerViewAppearance {
  /**
   * Color to tint the shimmer boxes. Defaults to the Fabric default color.
   */
  tintColor: number;

  /**
   * Corner radius on each view.
   */
  cornerRadius: number;

  /**
   * Corner radius on each UILabel. Set to < 0 to disable and use default `cornerRadius`.
   */
  labelCornerRadius: number;

  /**
   * usesTextHeightForLabels: True to enable shimmers to auto-adjust to font height for a UILabel -- this
   * will more accurately reflect the text in the label rect rather than using the bounding box. `labelHeight`
   * will take precedence over this property.
   */
  usesTextHeightForLabels: boolean;

  /**
   * If greater than 0, a fixed height to use for all UILabels. This will take precedence
   * over `usesTextHeightForLabels`. Set to less than 0 to disable.
   */
  labelHeight: number;
}

export interface IShimmerAppearance {
  alpha: number;
  width: number;

  /**
   * Angle of the direction of the gradient, in radian. 0 means horizontal, Pi/2 means vertical.
   */
  angle: number;

  /**
   * Speed of the animation, in point/seconds.
   */
  speed: number;

  /**
   * Delay between the end of a shimmering animation and the beginning of the next one, in seconds
   */
  delay: number;
}

export interface ShimmerTokens {}

/**
 * ViewProps props, based off of the standard react-native ViewProps with some new extensions
 */
export type ShimmerProps<TBase = IViewProps> = TBase & {
  /**
   * Appearance of the views that are shimmered. If not passed, the default will be used.
   */
  appearance?: IShimmerViewAppearance;

  /**
   * Appearance of the shimmer itself (the animation appearance)
   */
  shimmerAppearance?: IShimmerAppearance;
};

interface ShimmerType {
  props: ShimmerProps;
  slotProps: { root: ShimmerProps };
  tokens: ShimmerTokens;
}

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  slotProps: {
    root: buildProps<ShimmerProps, ShimmerTokens>(() => ({})),
  },
  slots: { root: NativeShimmerView },
  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    // stage one, execute any hooks, styling lookups to build the styled slot
    const Root = useSlots(props).root;
    // return a function used to complete the render
    return (rest: ShimmerProps, children: React.ReactNode) => <Root {...mergeProps(props, rest)}>{children}</Root>;
  },
});
