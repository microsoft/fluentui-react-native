import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { SpinnerProps, SpinnerSlotProps, SpinnerTokens } from './Spinner.types.win32';
import { spinnerName } from './Spinner.types.win32';
import { defaultSpinnerTokens, diameterSizeMap } from './SpinnerTokens';

export const stylingSettings: UseStylingOptions<SpinnerProps, SpinnerSlotProps, SpinnerTokens> = {
  tokens: [defaultSpinnerTokens, spinnerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: SpinnerTokens) => ({
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
