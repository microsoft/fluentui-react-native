import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

export type ScrollbarOrientation = 'vertical' | 'horizontal';
export type ScrollbarOwnerProps = Omit<ScrollViewProps, 'horizontal' | 'showsHorizontalScrollIndicator' | 'showsVerticalScrollIndicator'>;

export type ScrollbarProps = {
  scrollOwner: ScrollbarOwnerProps;
  orientation?: ScrollbarOrientation;
  enabled?: boolean;
  ref?: PropsWithRefOf<typeof ScrollView>['ref'];
  style?: StyleProp<ViewStyle>;
};

export type ScrollbarState = ComponentState<{ root: Slot<typeof ScrollView> }> & {
  style?: StyleProp<ViewStyle>;
  ownerStyle?: StyleProp<ViewStyle>;
  children?: ScrollbarOwnerProps['children'];
};
