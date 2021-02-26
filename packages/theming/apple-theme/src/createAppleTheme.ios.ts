import { ThemeReference } from '@fluentui-react-native/theme';
import { Theme } from '@fluentui-react-native/theme-types';
import { Appearance } from 'react-native';
import { BaseAppleDarkThemeIOS, BaseAppleLightThemeIOS } from './appleTheme.ios';

export function createAppleTheme(): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    const current = Appearance.getColorScheme();
    return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
  });

  Appearance.addChangeListener(() => {
    themeRef.invalidate();
  });

  return themeRef;
}
