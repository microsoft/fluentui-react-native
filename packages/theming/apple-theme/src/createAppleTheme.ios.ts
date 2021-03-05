import { ThemeReference } from '@fluentui-react-native/theme';
import { BaseAppleThemeIOS } from './appleTheme.ios';

export function createAppleTheme(): ThemeReference {
  const appleThemeReference = new ThemeReference(BaseAppleThemeIOS);
  return appleThemeReference;
}
