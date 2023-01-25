import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { spinnerName, SpinnerProps, SpinnerSlotProps, SpinnerTokens } from './Spinner.types';
import { defaultActivityIndicatorTokens } from './SpinnerTokens';

export const diameterSizeMap: { [key: string]: number } = {
  xxSmall: 12,
  xsmall: 16,
  medium: 24,
  large: 32,
  xLarge: 36,
};
export const lineThicknessSizeMap: { [key: string]: number } = {
  xxSmall: 1,
  xsmall: 1,
  medium: 2,
  large: 3,
  xLarge: 4,
};

export const stylingSettings: UseStylingOptions<SpinnerProps, SpinnerSlotProps, SpinnerTokens> = {
  tokens: [defaultActivityIndicatorTokens, spinnerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: SpinnerTokens) => ({
        spinnerColor: tokens.spinnerColor,
        size: tokens.size,
        lineThickness: tokens.lineThickness != 'medium' ? tokens.lineThickness : tokens.size,
        accessibilityLabel: 'spinner',
        accessible: true,
        style: {
          width: diameterSizeMap[tokens.size],
          height: diameterSizeMap[tokens.size],
        },
      }),
      ['spinnerColor', 'lineThickness', 'size'],
    ),
    svg: buildProps(
      (tokens: SpinnerTokens) => ({
        width: diameterSizeMap[tokens.size],
        height: diameterSizeMap[tokens.size],
      }),
      ['size'],
    ),
  },
};
