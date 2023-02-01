import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';
import { defaultShimmerTokens } from './ShimmerTokens';

export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [defaultShimmerTokens, shimmerName],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens) => ({
        accessibilityRole: 'progressbar',
        accessible: true,
        angle: tokens.angle,
        delay: tokens.delay,
        duration: tokens.duration,
        shimmerColor: tokens.shimmerColor,
        shimmerColorOpacity: tokens.shimmerColorOpacity,
        shimmerWaveColor: tokens.shimmerWaveColor,
        shimmerWaveColorOpacity: tokens.shimmerWaveColorOpacity,
      }),
      ['angle', 'delay', 'duration', 'shimmerColor', 'shimmerColorOpacity', 'shimmerWaveColor', 'shimmerWaveColorOpacity'],
    ),
  },
};
