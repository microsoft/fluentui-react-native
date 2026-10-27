import type { PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, View, ViewStyle } from 'react-native';

export type StoryGroupProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'style'> & {
  children: ReactNode;
  label: string;
  labelTestID?: string;
  labelStyle?: StyleProp<TextStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};
