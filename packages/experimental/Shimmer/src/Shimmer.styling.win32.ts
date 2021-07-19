import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types.win32';
export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    () => ({
      angle: 0,
      delay: 0,
      duration: 7000,
      gradientOpacity: 0.7,
      gradientTintColor: 'white',
      shimmerTintColor: '#E1E1E1',
    }),
    shimmerName,
  ],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(() => ({
      style: { flexGrow: 0 },
      accessible: true,
      accessibilityRole: 'progressbar',
    })),
    shimmerWaveContainer: buildProps(
      (tokens: ShimmerTokens) => ({
        style: { overflow: 'hidden', flexGrow: 0 },
        delay: tokens.delay,
        duration: tokens.duration,
      }),
      ['delay', 'duration'],
    ),
    // Absolute positioning is used to overlay the clipping mask on top of the shimmer wave.
    shimmerWave: buildProps(
      (tokens: ShimmerTokens) => ({
        style: { flexGrow: 0 },
        angle: tokens.angle,
        gradientOpacity: tokens.gradientOpacity,
        gradientTintColor: tokens.gradientTintColor,
        shimmerTintColor: tokens.shimmerTintColor,
      }),
      ['angle', 'gradientOpacity', 'gradientTintColor', 'shimmerTintColor'],
    ),
    clippingMask: buildProps(() => ({
      style: { position: 'absolute', flexGrow: 0 },
    })),
  },
};
