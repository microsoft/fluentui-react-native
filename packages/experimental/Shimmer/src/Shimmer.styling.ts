import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';
import { shimmerName } from './Shimmer.types';
import { defaultShimmerTokens } from './ShimmerTokens';

export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [defaultShimmerTokens, shimmerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens) => ({
        accessibilityRole: 'progressbar',
        accessible: true,
        style: { overflow: 'hidden', backgroundColor: tokens.backgroundColor },
        angle: tokens.angle,
        delay: tokens.delay,
        duration: tokens.duration,
        shimmerColor: tokens.shimmerColor,
        shimmerColorOpacity: tokens.shimmerColorOpacity,
        shimmerWaveColor: tokens.shimmerWaveColor,
        shimmerWaveColorOpacity: tokens.shimmerWaveColorOpacity,
      }),
      [
        'angle',
        'delay',
        'duration',
        'shimmerColor',
        'shimmerColorOpacity',
        'shimmerWaveColor',
        'shimmerWaveColorOpacity',
        'backgroundColor',
      ],
    ),
  },
};
