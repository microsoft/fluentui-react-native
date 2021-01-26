import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultAppleThemeIOS } from './appleTheme.ios';
import { defaultAppleThemeMacOS } from './appleTheme.macos';
import { Theme } from '@fluentui-react-native/theme-types';
import { Platform } from 'react-native';

export function createAppleTheme(): ThemeReference {
  if (Platform.OS === 'macos') {
    return new ThemeReference({} as Theme, defaultAppleThemeMacOS);
  } else if (Platform.OS === 'ios') {
    return new ThemeReference({} as Theme, defaultAppleThemeIOS);
  } else {
    throw new Error('Trying to use apple theme on non apple platform');
  }
}
