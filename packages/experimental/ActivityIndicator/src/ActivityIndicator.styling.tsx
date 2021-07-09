import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
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
    (t) => ({
      activityIndicatorColor: t.host?.appearance === 'light' ? '#BDBDBD' : '#666666',
      lineThickness: 'medium',
      size: 'medium',
    }),
    activityIndicatorName,
  ],
  slotProps: {
    root: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        activityIndicatorColor: tokens.activityIndicatorColor,
        lineThickness: tokens.lineThickness,
        size: tokens.size,
        // Bug: accessibilityRole does not work on iOS
        accessibilityRole: 'progressbar',
        accessible: true,
      }),
      ['activityIndicatorColor', 'lineThickness', 'size'],
    ),
  },
};
