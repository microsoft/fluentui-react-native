import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultAppleThemeMacOS } from './appleTheme';

export function createAppleTheme(): ThemeReference {
  return new ThemeReference(defaultAppleThemeMacOS);
}
