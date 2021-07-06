import { ThemeReference } from '@fluentui-react-native/theme';
import { Theme } from '@fluentui-react-native/theme-types';
import { Appearance } from 'react-native';
import { getBaseAppleThemeMacOS } from './appleTheme.macos';

export function createAppleTheme(): ThemeReference {
  const appleThemeReference = new ThemeReference({} as Theme, () => {
    return getBaseAppleThemeMacOS();
  });

  Appearance.addChangeListener(() => {
    appleThemeReference.invalidate();
  });

  return appleThemeReference;
}
