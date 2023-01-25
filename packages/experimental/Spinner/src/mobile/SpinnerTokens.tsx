import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { SpinnerTokens } from './Spinner.types';
import { Appearance } from 'react-native';

export const defaultActivityIndicatorTokens: TokenSettings<SpinnerTokens, Theme> = () =>
  ({
    spinnerColor: Appearance.getColorScheme() === 'light' ? '#BDBDBD' : '#666666',
    lineThickness: 'medium',
    size: 'medium',
  } as SpinnerTokens);
