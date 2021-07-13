import { UseStylingOptions, buildProps, Theme } from '@fluentui-react-native/framework';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import {
  activityIndicatorName,
  ActivityIndicatorProps,
  ActivityIndicatorSlotProps,
  ActivityIndicatorTokens,
} from './ActivityIndicator.types';

export const diameterSizeMap: { [key: string]: number } = {
  xSmall: 12,
  small: 16,
  medium: 24,
  large: 32,
  xLarge: 36,
};
export const lineThicknessSizeMap: { [key: string]: number } = {
  xSmall: 1,
  small: 1,
  medium: 2,
  large: 3,
  xLarge: 4,
};

export const stylingSettings: UseStylingOptions<ActivityIndicatorProps, ActivityIndicatorSlotProps, ActivityIndicatorTokens> = {
  tokens: [
    () => ({
      activityIndicatorColor: '#BDBDBD',
      lineThickness: 'medium',
      size: 'medium',
    }),
    activityIndicatorName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ActivityIndicatorTokens, theme: Theme) => ({
        activityIndicatorColor: getCurrentAppearance(theme.host.appearance, 'light') === 'light' ? '#BDBDBD' : '#666666',
        lineThickness: tokens.lineThickness,
        size: tokens.size,
        accessibilityRole: 'progressbar',
        accessible: true,
      }),
      ['activityIndicatorColor', 'lineThickness', 'size'],
    ),
  },
};
