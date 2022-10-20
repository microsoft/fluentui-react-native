import { ThemeReference } from '@fluentui-react-native/theme';
import { Theme } from '@fluentui-react-native/theme-types';
import { Appearance } from 'react-native';
import { getBaseAppleThemeIOS } from './appleTheme.ios';

export function createAppleTheme(): ThemeReference {
  const appleThemeReference = new ThemeReference({} as Theme, () => {
    const isLightMode = Appearance.getColorScheme() === 'light';
    return getBaseAppleThemeIOS(isLightMode);
  });

  Appearance.addChangeListener(() => {
    appleThemeReference.invalidate();
  });

  return appleThemeReference;
}
