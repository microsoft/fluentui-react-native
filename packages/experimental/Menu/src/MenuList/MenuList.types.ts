import type { IViewProps } from '@fluentui-react-native/adapters';

export const menuListName = 'MenuList';

export interface MenuListTokens {}

export interface MenuListProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps>;
}
export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
