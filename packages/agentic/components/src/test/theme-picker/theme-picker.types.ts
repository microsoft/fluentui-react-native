import type { ThemeAppearanceRequest } from '@fluentui-react-native/design/theming';
import type { StyleProp, ViewStyle } from 'react-native';

export type TestThemeSource = 'flex' | 'fluent';

export type TestThemeSelection = { source: 'inherit' } | { source: TestThemeSource; appearance: Readonly<ThemeAppearanceRequest> };

export type ThemePickerProps = {
  selection: TestThemeSelection;
  onSelectionChange: (selection: TestThemeSelection) => void;
  testIDPrefix?: string;
  style?: StyleProp<ViewStyle>;
};
