import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultAppleTheme } from './appleTheme';
import { Theme } from '@fluentui-react-native/theme-types';

export function createAppleTheme(): ThemeReference {
  return new ThemeReference({} as Theme, defaultAppleTheme);
}
