import { createDefaultTheme, ThemeOptions } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/theme';

export function createFluentTheme(options?: ThemeOptions): ThemeReference {
  return createDefaultTheme(options);
}
