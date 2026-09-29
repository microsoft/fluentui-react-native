import { createAppleTheme } from '@fluentui-react-native/apple-theme';
import type { Theme } from '@fluentui-react-native/design/theming';

export function createColorPinningTheme(): Theme {
  return createAppleTheme().theme;
}
