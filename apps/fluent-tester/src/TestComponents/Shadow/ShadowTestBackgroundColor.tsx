import { Appearance, Platform } from 'react-native';
import { Theme } from '@fluentui-react-native/theme-types';

/**
 * The default dark mode iOS background color from the theme is black ('#000000'), which shadows are not visible against.
 * Shadows are also not very visible when placed on a view that is black.
 *
 * For dark mode iOS, returns a dark grey that shadows are visible on. Otherwise, will return either undefined or the default
 * background color from the theme based on whether or not a theme has been provided.
 */
export const shadowTestPageBackgroundColor = (t?: Theme) => {
  if (Platform.OS === 'ios' && Appearance.getColorScheme() === 'dark') {
    return '#313131';
  }
  return t?.colors.background;
};
