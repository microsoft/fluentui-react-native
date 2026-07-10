import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/design/theming';

export function createAppleTheme(): ThemeReference {
  console.warn('Platform is not supported by apple theme, using default theme');
  return new ThemeReference(createDefaultTheme());
}
