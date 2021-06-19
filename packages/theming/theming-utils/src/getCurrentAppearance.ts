import { Appearance } from 'react-native';
import { AppearanceOptions, ThemeOptions } from '@fluentui-react-native/theme-types';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}
