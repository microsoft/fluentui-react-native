import { ThemeReference } from '@fluentui-react-native/theme';
import { BaseAppleThemeMacOS } from './appleTheme.macos';

const appleThemeReference = new ThemeReference(BaseAppleThemeMacOS);

export function createAppleTheme(): ThemeReference {
  return appleThemeReference;
}
