import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { Appearance } from 'react-native';
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
      activityIndicatorColor: Appearance.getColorScheme() === 'light' ? '#BDBDBD' : '#666666',
      lineThickness: 'medium',
      size: 'medium',
    }),
    activityIndicatorName,
  ],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        activityIndicatorColor: tokens.activityIndicatorColor,
        size: tokens.size,
        lineThickness: tokens.lineThickness != 'medium' ? tokens.lineThickness : tokens.size,
        accessibilityLabel: 'progressbar',
        accessible: true,
        style: {
          width: diameterSizeMap[tokens.size],
          height: diameterSizeMap[tokens.size],
        },
      }),
      ['activityIndicatorColor', 'lineThickness', 'size'],
    ),
    svg: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        width: diameterSizeMap[tokens.size],
        height: diameterSizeMap[tokens.size],
      }),
      ['size'],
    ),
  },
};
