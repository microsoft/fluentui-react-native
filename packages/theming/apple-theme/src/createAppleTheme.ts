import { ThemeReference } from '@fluentui-react-native/theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';

export function createAppleTheme(): ThemeReference {
  console.warn('Platform is not supported by apple theme, using default theme');
  return new ThemeReference(createDefaultTheme());
}
