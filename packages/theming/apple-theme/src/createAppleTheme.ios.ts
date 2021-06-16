import { ThemeReference } from '@fluentui-react-native/theme';
import { Theme } from '@fluentui-react-native/theme-types';
import { Appearance } from 'react-native';
import { BaseAppleDarkThemeIOS, BaseAppleLightThemeIOS } from './appleTheme.ios';

export function createAppleTheme(): ThemeReference {
  const baseAppleTheme = () => {
    const current = Appearance.getColorScheme();
    return current === 'light' ? BaseAppleLightThemeIOS : BaseAppleDarkThemeIOS;
  };

  const appleThemeReference = new ThemeReference({} as Theme, baseAppleTheme);

  Appearance.addChangeListener(() => {
    appleThemeReference.invalidate();
  });

  return appleThemeReference;
}
