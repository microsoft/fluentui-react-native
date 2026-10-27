import type { PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, View, ViewStyle } from 'react-native';

export type StoryItemProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'style'> & {
  children: ReactNode;
  label: string;
  labelStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};
