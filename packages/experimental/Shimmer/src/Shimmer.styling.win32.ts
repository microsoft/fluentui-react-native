import { UseStylingOptions, buildProps, Theme, TokenSettings } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerTokens } from './Shimmer.types';
import { ShimmerSlotProps } from './Shimmer.types.win32';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens> = (theme: Theme) =>
  ({
    angle: 0,
    backgroundColor: theme.colors.background,
    delay: 500,
    duration: 2000,
    shimmerColor: theme.colors.bodyFrameDivider,
    shimmerColorOpacity: 1,
    shimmerWaveColor: '#E1E1E1',
    shimmerWaveColorOpacity: 1,
    shimmerWaveWidth: '100%',
  } as ShimmerTokens);

/**
 * tell the styling hook how to build up the tokens
 */
export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [defaultShimmerTokens, shimmerName],
  slotProps: {
    root: buildProps(() => ({
      accessibilityRole: 'progressbar',
      accessible: true,
    })),

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
