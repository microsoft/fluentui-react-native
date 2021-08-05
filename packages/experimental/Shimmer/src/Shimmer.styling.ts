import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';

export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    () => ({
      duration: 7000,
      delay: 0,
      shimmerWaveColor: 'white', // Baseline component is the light mode color
      shimmerColor: '#E1E1E1', // Baseline component is the light mode color
      angle: 0,
      gradientOpacity: 0.7,
    }),
    shimmerName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens, theme: Theme) => ({
        duration: tokens.duration,
        delay: tokens.delay,
        shimmerWaveColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? 'white' : 'black',
        shimmerColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? '#E1E1E1' : '#404040',
        angle: tokens.angle,
        gradientOpacity: tokens.gradientOpacity,
        accessibilityRole: 'progressbar',
        accessible: true,
      }),
      ['shimmerWaveColor', 'duration', 'delay', 'shimmerColor', 'angle', 'gradientOpacity'],
    ),
  },
};
