import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { SpinnerProps, SpinnerSlotProps, SpinnerTokens } from './Spinner.types';
import { spinnerName } from './Spinner.types';
import { defaultSpinnerTokens } from './SpinnerTokens';

export const diameterSizeMap: { [key: string]: number } = {
  'xx-small': 12,
  'x-small': 16,
  medium: 24,
  large: 32,
  'x-large': 40,
};
export const lineThicknessSizeMap: { [key: string]: number } = {
  'xx-small': 1,
  'x-small': 1,
  medium: 2,
  large: 3,
  'x-large': 4,
};

export const stylingSettings: UseStylingOptions<SpinnerProps, SpinnerSlotProps, SpinnerTokens> = {
  tokens: [defaultSpinnerTokens, spinnerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: SpinnerTokens) => ({
        trackColor: tokens.trackColor,
        size: tokens.size,
        lineThickness: tokens.size != 'medium' ? tokens.size : tokens.size,
        accessibilityRole: 'progressbar',
        accessible: true,
        style: {
          width: diameterSizeMap[tokens.size],
          height: diameterSizeMap[tokens.size],
        },
      }),
      ['trackColor', 'size'],
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
