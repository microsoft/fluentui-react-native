import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';

export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    {
      toValue: 30,
      duration: 7000,
      delay: 0,
      gradientTintColor: 'white',
      shimmerTintColor:"#E1E1E1",
      containerWidth: "100%",
      containerHeight: "100%",
    },
    shimmerName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens) => ({
        gradientTintColor:tokens.gradientTintColor,
        toValue:tokens.toValue,
        duration: tokens.duration,
        delay: tokens.delay,
        shimmerTintColor:tokens.shimmerTintColor,
        containerWidth: tokens.containerWidth,
        containerHeight: tokens.containerHeight,
      }),
      ['toValue', 'duration', 'delay', 'gradientTintColor', 'shimmerTintColor', 'containerHeight', 'containerWidth'],
    ),
    rect: buildProps(
      (_tokens: ShimmerTokens) => ({
        width: 300,
        height: 30,
        rx:5,
        ry:5,
        x:170,
        y:30,
      }),

    ),
    circle: buildProps((_tokens: ShimmerTokens) => ({
      cx:75,
      cy:75,
      r:50,
    }),
    ),
    image: buildProps((_tokens: ShimmerTokens) => ({
      href: null,
    }),
    ),
  },

};
