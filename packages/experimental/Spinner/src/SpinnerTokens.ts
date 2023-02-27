import { Appearance } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { SpinnerTokens } from './Spinner.types';

export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = () =>
  ({
    trackColor: Appearance.getColorScheme() === 'light' ? '#BDBDBD' : '#666666',
    lineThickness: 'medium',
    size: 'medium',
  } as SpinnerTokens);
