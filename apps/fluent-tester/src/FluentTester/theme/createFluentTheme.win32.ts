import { ThemeOptions } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/theme';
import { createOfficeTheme } from '@fluentui-react-native/win32-theme';

export function createFluentTheme(options?: ThemeOptions): ThemeReference {
  return createOfficeTheme(options);
}
