import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ActivityIndicatorTokens } from './Spinner.types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { Appearance } from 'react-native';
export const defaultActivityIndicatorTokens: TokenSettings<ActivityIndicatorTokens, Theme> = () => ({
  activityIndicatorColor: Appearance.getColorScheme() === 'light' ? globalTokens.color.grey56 : globalTokens.color.grey72,
  lineThickness: 'medium',
  size: 'medium',
});
