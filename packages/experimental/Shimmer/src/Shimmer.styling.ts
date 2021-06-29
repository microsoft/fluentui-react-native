import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { shimmerName, ShimmerProps, ShimmerSlotProps, ShimmerTokens } from './Shimmer.types';

export const stylingSettings: UseStylingOptions<ShimmerProps, ShimmerSlotProps, ShimmerTokens> = {
  tokens: [
    () => ({
      toValue: 30,
      duration: 7000,
      delay: 0,
      gradientTintColor: 'white', // Baseline component is the light mode color
      shimmerTintColor: '#E1E1E1', // Baseline component is the light mode color
      width: 200,
      height: 100,
      angle: 0,
      gradientOpacity: 0.7,
    }),
    shimmerName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ShimmerTokens, theme: Theme) => ({
        toValue: tokens.toValue,
        duration: tokens.duration,
        delay: tokens.delay,
        gradientTintColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? 'white' : 'black',
        shimmerTintColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? '#E1E1E1' : '#404040',
        width: tokens.width,
        height: tokens.height,
        angle: tokens.angle,
        gradientOpacity: tokens.gradientOpacity,
        accessibilityRole: 'progressbar',
        accessible: true,
      }),
      ['gradientTintColor', 'toValue', 'duration', 'delay', 'shimmerTintColor', 'width', 'height', 'angle', 'gradientOpacity'],
    ),
    image: buildProps((_tokens: ShimmerTokens) => ({
      href: null,
    })),
  },
};
