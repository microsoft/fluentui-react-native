import type { Theme, Variant } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SpinnerSize, SpinnerTokens } from './Spinner.types';
import { diameterSizeMap, lineThicknessSizeMap } from './SpinnerSizeMaps';

export { diameterSizeMap, lineThicknessSizeMap };

export const textStyleMap: { [key: string]: Variant } = {
  tiny: 'body1',
  'x-small': 'body1',
  small: 'body1',
  medium: 'subtitle2',
  large: 'subtitle2',
  'x-large': 'subtitle2',
  huge: 'subtitle1',
};

export const getDefaultSize = (): SpinnerSize => {
  return 'medium';
};

export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = (t: Theme) =>
  ({
    tiny: {
      size: 'tiny',
      width: diameterSizeMap['tiny'],
      height: diameterSizeMap['tiny'],
    },
    'x-small': {
      size: 'x-small',
      width: diameterSizeMap['x-small'],
      height: diameterSizeMap['x-small'],
    },
    small: {
      size: 'small',
      width: diameterSizeMap['small'],
      height: diameterSizeMap['small'],
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
    'x-large': {
      size: 'x-large',
      width: diameterSizeMap['x-large'],
      height: diameterSizeMap['x-large'],
    },
    huge: {
      size: 'huge',
      width: diameterSizeMap['huge'],
      height: diameterSizeMap['huge'],
    },
    tailColor: t.colors.brandStroke1,
    trackColor: t.colors.brandStroke2,
    inverted: {
      tailColor: t.colors.neutralStroke2,
      trackColor: t.colors.neutralBackgroundInverted,
    },
  }) as SpinnerTokens;
