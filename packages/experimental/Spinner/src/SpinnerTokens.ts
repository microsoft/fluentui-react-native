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
    trackColor: t.colors.brandStroke2,
  } as SpinnerTokens);
