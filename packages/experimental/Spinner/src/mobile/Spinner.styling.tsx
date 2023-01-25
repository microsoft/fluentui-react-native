import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { activityIndicatorName, ActivityIndicatorProps, ActivityIndicatorSlotProps, ActivityIndicatorTokens } from './Spinner.types';
import { defaultActivityIndicatorTokens } from './SpinnerTokens';

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
  tokens: [defaultActivityIndicatorTokens, activityIndicatorName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: ActivityIndicatorTokens) => ({
        activityIndicatorColor: tokens.activityIndicatorColor,
        size: tokens.size,
        lineThickness: tokens.lineThickness != 'medium' ? tokens.lineThickness : tokens.size,
        accessibilityLabel: 'spinner',
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
