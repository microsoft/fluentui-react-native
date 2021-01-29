import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultAppleThemeMacOS } from './appleTheme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { Platform } from 'react-native';

export function createAppleTheme(): ThemeReference {
  const appleTheme = Platform.select({
    macos: () => new ThemeReference(defaultAppleThemeMacOS),
    ios: () => {
      console.log('iOS Theme not currently supported, using default theme');
      return new ThemeReference(createDefaultTheme());
    },
  })();
  return appleTheme;
}
