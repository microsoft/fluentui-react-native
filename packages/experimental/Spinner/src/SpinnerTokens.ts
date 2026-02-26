import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SpinnerTokens } from './Spinner.types';

/* Mobile sizes */
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

export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = (t: Theme) =>
  ({
    xxSmall: {
      size: 'xx-small',
      width: diameterSizeMap['xx-small'],
      height: diameterSizeMap['xx-small'],
    },
    small: {
      size: 'x-small',
      width: diameterSizeMap['x-small'],
      height: diameterSizeMap['x-small'],
    },
    medium: {
      size: 'medium',
      width: diameterSizeMap['medium'],
      height: diameterSizeMap['medium'],
    },
    large: {
      size: 'large',
      width: diameterSizeMap['large'],
      height: diameterSizeMap['large'],
    },
    xlarge: {
      size: 'x-large',
      width: diameterSizeMap['x-large'],
      height: diameterSizeMap['x-large'],
    },
    trackColor: t.colors.brandStroke2,
  }) as SpinnerTokens;
