import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { SpinnerProps, SpinnerSlotProps, SpinnerTokens } from './Spinner.types.win32';
import { spinnerName } from './Spinner.types.win32';
import { defaultSpinnerTokens } from './SpinnerTokens';

export const stylingSettings: UseStylingOptions<SpinnerProps, SpinnerSlotProps, SpinnerTokens> = {
  tokens: [defaultSpinnerTokens, spinnerName],
  tokensThatAreAlsoProps: 'all',
  slotProps: {
    root: buildProps(
      (tokens: SpinnerTokens) => ({
        style: {
          width: tokens.width,
          height: tokens.height,
        },
      }),
      ['width', 'height'],
    ),
    track: buildProps(
      (tokens: SpinnerTokens) => ({
        size: tokens.size,
        trackColor: tokens.trackColor,
        viewBoxWidth: tokens.width,
        viewBoxHeight: tokens.height,
      }),
      ['size', 'trackColor', 'width', 'height'],
    ),
    tail: buildProps(
      (tokens: SpinnerTokens) => ({
        size: tokens.size,
        tailColor: tokens.tailColor,
        viewBoxWidth: tokens.width,
        viewBoxHeight: tokens.height,
      }),
      ['size', 'tailColor', 'width', 'height'],
    ),
  },
};
