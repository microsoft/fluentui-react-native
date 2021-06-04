import { ThemeReference } from '@fluentui-react-native/theme';
import { Appearance } from 'react-native';
import { BaseAppleThemeMacOS } from './appleTheme.macos';

export function createAppleTheme(): ThemeReference {
  const appleThemeReference = new ThemeReference(BaseAppleThemeMacOS);

  Appearance.addChangeListener(() => {
    appleThemeReference.invalidate();
  });

  return appleThemeReference;
}
