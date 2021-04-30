import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';
export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    (t) => ({
      toValue: 30,
      duration: 7000,
      delay: 0,
      gradientTintColor: t.host?.appearance === 'light' ? 'white' : 'black',
      shimmerTintColor: t.host?.appearance === 'light' ? "#E1E1E1" : '#404040',
      width: 200,
      height: 200,
      angle: 0,
    }),
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
        width: tokens.width,
        height: tokens.height,
        angle: tokens.angle,
      }),
      ['toValue', 'duration', 'delay', 'gradientTintColor', 'shimmerTintColor', 'width', 'height'],
    ),
    rect: buildProps(
      (_tokens: ShimmerTokens) => ({
        width: 300,
        height: 30,
      }),

    ),
    circle: buildProps((_tokens: ShimmerTokens) => ({
      r:50,
    }),
    ),
    image: buildProps((_tokens: ShimmerTokens) => ({
      href: null,
    }),
    ),
  },
};
