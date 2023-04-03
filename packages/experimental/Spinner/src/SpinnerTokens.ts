import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SpinnerTokens } from './Spinner.types';

export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = (t: Theme) =>
  ({
    trackColor: t.colors.brandStroke2,
    size: 'medium',
  } as SpinnerTokens);
