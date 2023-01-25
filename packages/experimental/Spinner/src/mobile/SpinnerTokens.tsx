import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ActivityIndicatorTokens } from './Spinner.types';
import { Appearance } from 'react-native';

export const defaultActivityIndicatorTokens: TokenSettings<ActivityIndicatorTokens, Theme> = () =>
  ({
    activityIndicatorColor: Appearance.getColorScheme() === 'light' ? '#BDBDBD' : '#666666',
    lineThickness: 'medium',
    size: 'medium',
  } as ActivityIndicatorTokens);
