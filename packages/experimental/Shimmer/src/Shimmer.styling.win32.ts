import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { ShimmerProps, ShimmerTokens } from './Shimmer.types';
import { shimmerName } from './Shimmer.types';
import type { ShimmerSlotProps } from './Shimmer.types.win32';
import { defaultShimmerTokens } from './ShimmerTokens.win32';

/**
 * tell the styling hook how to build up the tokens
 */
export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [defaultShimmerTokens, shimmerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens) => ({
        accessibilityRole: 'progressbar',
        accessible: true,
        style: { overflow: 'hidden', backgroundColor: tokens.backgroundColor },
      }),
      ['backgroundColor'],
    ),

    shimmerWaveContainer: buildProps(
      (tokens: ShimmerTokens) => ({
        delay: tokens.delay,
        duration: tokens.duration,
        shimmerColor: tokens.shimmerColor,
      }),
      ['delay', 'duration', 'shimmerColor'],
    ),

    shimmerWave: buildProps(
      (tokens: ShimmerTokens) => ({
        angle: tokens.angle,
        shimmerColor: tokens.shimmerColor,
        shimmerWaveColor: tokens.shimmerWaveColor,
        shimmerWaveWidth: tokens.shimmerWaveWidth,
      }),
      ['angle', 'shimmerColor', 'shimmerWaveColor', 'shimmerWaveWidth'],
    ),

    clippingMask: buildProps(
      (tokens: ShimmerTokens) => ({
        backgroundColor: tokens.backgroundColor,
      }),
      ['backgroundColor'],
    ),
  },
};
