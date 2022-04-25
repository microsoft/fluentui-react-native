import type { IViewProps } from '@fluentui-react-native/adapters';

export const menuItemName = 'MenuItem';

export interface MenuItemProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuItemState {}
