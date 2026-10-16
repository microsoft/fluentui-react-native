import type { Theme } from '@fluentui-react-native/design/theming';
import { createOfficeTheme } from '@fluentui-react-native/win32-theme';

export function createColorPinningTheme(): Theme {
  return createOfficeTheme({ appearance: 'light', paletteName: 'TaskPane' }).theme;
}
