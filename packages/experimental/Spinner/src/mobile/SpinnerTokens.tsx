import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';
import type { SpinnerTokens } from './Spinner.types';
import { Appearance } from 'react-native';

export const defaultSpinnerTokens: TokenSettings<SpinnerTokens, Theme> = () =>
  ({
    spinnerColor: Appearance.getColorScheme() === 'light' ? '#BDBDBD' : '#666666',
    lineThickness: 'medium',
    size: 'medium',
  } as SpinnerTokens);
