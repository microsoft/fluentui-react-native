import { UseStylingOptions, buildProps, Theme, TokenSettings } from '@fluentui-react-native/framework';
import { shimmerName, ShimmerProps, ShimmerTokens } from './Shimmer.types';
import { ShimmerSlotProps } from './Shimmer.types.win32';

export const defaultShimmerTokens: TokenSettings<ShimmerTokens> = (theme: Theme) =>
  ({
    angle: 0,
    shimmerBackground: theme.colors.background,
    delay: 500,
    duration: 2000,
    gradientOpacity: 1,
    shimmerColor: theme.colors.bodyFrameDivider,
    shimmerWaveColor: 'orange',
  } as ShimmerTokens);

/**
 * tell the styling hook how to build up the tokens
 */
export const styleSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [defaultShimmerTokens, shimmerName],
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
        shimmerColor: tokens.shimmerColor,
      }),
      ['delay', 'duration', 'shimmerColor'],
    ),

    shimmerWave: buildProps(
      (tokens: ShimmerTokens) => ({
        style: { flexGrow: 0 },
        angle: tokens.angle,
        gradientOpacity: tokens.gradientOpacity,
        shimmerColor: tokens.shimmerColor,
        shimmerWaveColor: tokens.shimmerWaveColor,
      }),
      ['angle', 'gradientOpacity', 'shimmerColor', 'shimmerWaveColor'],
    ),

    /** Absolute positioning is used to overlay the clipping mask on top of the shimmer wave. */
    clippingMask: buildProps(
      (tokens: ShimmerTokens) => ({
        style: { position: 'absolute', flexGrow: 0 },
        shimmerBackground: tokens.shimmerBackground,
      }),
      ['shimmerBackground'],
    ),
  },
};
