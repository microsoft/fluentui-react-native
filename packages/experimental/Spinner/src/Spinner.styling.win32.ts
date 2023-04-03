import type { UseStylingOptions, Variant } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { SpinnerProps, SpinnerSlotProps, SpinnerTokens } from './Spinner.types.win32';
import { spinnerName } from './Spinner.types.win32';
import { defaultSpinnerTokens } from './SpinnerTokens';

export const diameterSizeMap: { [key: string]: number } = {
  tiny: 20,
  'x-small': 24,
  small: 28,
  medium: 32,
  large: 36,
  'x-large': 40,
  huge: 44,
};
export const lineThicknessSizeMap: { [key: string]: number } = {
  tiny: 2,
  'x-small': 2,
  small: 2,
  medium: 3,
  large: 3,
  'x-large': 3,
  huge: 4,
};

export const textStyleMap: { [key: string]: Variant } = {
  tiny: 'body1',
  'x-small': 'body1',
  small: 'body1',
  medium: 'subtitle2',
  large: 'subtitle2',
  'x-large': 'subtitle2',
  huge: 'subtitle1',
};

export const stylingSettings: UseStylingOptions<SpinnerProps, SpinnerSlotProps, SpinnerTokens> = {
  tokens: [defaultSpinnerTokens, spinnerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: SpinnerTokens) => ({
        accessibilityRole: 'progressbar',
        accessible: true,
        style: {
          width: diameterSizeMap[tokens.size],
          height: diameterSizeMap[tokens.size],
        },
      }),
      ['size'],
    ),
    track: buildProps(
      (tokens: SpinnerTokens) => ({
        size: tokens.size,
        trackColor: tokens.trackColor,
        viewBoxWidth: diameterSizeMap[tokens.size],
        viewBoxHeight: diameterSizeMap[tokens.size],
      }),
      ['size', 'trackColor'],
    ),
  },
};
