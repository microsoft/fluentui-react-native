import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';

export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    () => ({
      angle: 0,
      delay: 0,
      duration: 7000,
      shimmerColor: '#E1E1E1', // Baseline component is the light mode color
      shimmerColorOpacity: 1,
      shimmerWaveColor: 'white', // Baseline component is the light mode color
      shimmerWaveColorOpacity: 1,
    }),
    shimmerName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens, theme: Theme) => ({
        accessibilityRole: 'progressbar',
        accessible: true,
        angle: tokens.angle,
        delay: tokens.delay,
        duration: tokens.duration,
        shimmerColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? '#E1E1E1' : '#404040',
        shimmerColorOpacity: tokens.shimmerColorOpacity,
        shimmerWaveColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? 'white' : 'black',
        shimmerWaveColorOpacity: tokens.shimmerWaveColorOpacity,
      }),
      ['angle', 'delay', 'duration', 'shimmerColor', 'shimmerColorOpacity', 'shimmerWaveColor', 'shimmerWaveColorOpacity'],
    ),
  },
};
