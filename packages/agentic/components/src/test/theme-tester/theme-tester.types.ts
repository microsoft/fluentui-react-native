import type { ThemeAppearanceRequest } from '@fluentui-react-native/design/theming';
import type { PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { ReactNode } from 'react';
import type { StyleProp, View, ViewStyle } from 'react-native';

import type { TestThemeSelection } from '../theme-picker/theme-picker.types';

export type ThemeTesterProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'style'> & {
  children?: ReactNode;
  selection?: TestThemeSelection;
  defaultSelection?: TestThemeSelection;
  onSelectionChange?: (selection: TestThemeSelection) => void;
  testIDPrefix?: string;
  style?: StyleProp<ViewStyle>;
};

export type { ThemeAppearanceRequest, TestThemeSelection };
