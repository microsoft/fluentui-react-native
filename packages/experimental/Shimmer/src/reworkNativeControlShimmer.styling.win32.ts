import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './reworkNativeControlShimmer.types.win32';
export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    (t) => ({
      angle: 0,
      delay: 0,
      duration: 7000,
      gradientOpacity: 0.7,
      gradientTintColor: t.host?.appearance === 'light' ? 'white' : 'black',
      shimmerTintColor: t.host?.appearance === 'light' ? '#E1E1E1' : '#404040',
    }),
    shimmerName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens) => ({
        accessible: true,
        accessibilityRole: 'progressbar',
        angle: tokens.angle,
        delay: tokens.delay,
        duration: tokens.duration,
        gradientOpacity: tokens.gradientOpacity,
        gradientTintColor: tokens.gradientTintColor,
        shimmerTintColor: tokens.shimmerTintColor,
        width: tokens.width,
      }),
      ['angle', 'delay', 'duration', 'gradientOpacity', 'gradientTintColor', 'shimmerTintColor', 'width'],
    ),
    image: buildProps((_tokens: ShimmerTokens) => ({
      href: null,
    })),

    // Absolute positioning is used to overlay the clipping mask on top of the shimmer wave.
    // shimmerWave: buildProps((_tokens: ShimmerTokens) => ({
    //   style: { position: 'absolute' },
    // })),
    // clippingMask: buildProps((_tokens: ShimmerTokens) => ({
    //   style: { position: 'absolute' },
    // })),
  },
};
