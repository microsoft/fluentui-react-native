import type { PropsWithRefOf } from '@fluentui-react-native/framework-base';
import type { View } from 'react-native';

export type StoryStatusProps = Omit<
  PropsWithRefOf<typeof View>,
  'accessible' | 'accessibilityLabel' | 'accessibilityRole' | 'children' | 'testID'
> & {
  children: string;
  testID: string;
};
