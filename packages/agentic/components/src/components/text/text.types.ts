import type { Text as NativeText, StyleProp, TextStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';

export type TextSlots = {
  root: Slot<typeof NativeText>;
};

export type TextProps = PropsWithRefOf<typeof NativeText>;

export type TextState = ComponentState<TextSlots> &
  ThemeState & {
    userStyle: StyleProp<TextStyle>;
  };
