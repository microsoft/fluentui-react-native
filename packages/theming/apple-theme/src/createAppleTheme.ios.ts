import { ThemeReference } from '@fluentui-react-native/theme';
import { BaseAppleThemeIOS } from './appleTheme.ios';

export function createAppleTheme(): ThemeReference {
  return new ThemeReference(BaseAppleThemeIOS);
}
