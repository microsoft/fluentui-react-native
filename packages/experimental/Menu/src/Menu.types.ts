import type { IViewProps } from '@fluentui-react-native/adapters';

export const menuName = 'Menu';

export interface MenuTokens {}

export interface MenuProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuState {}

export interface MenuSlotProps {}

export interface MenuType {
  props: MenuProps;
  tokens: MenuTokens;
  slotProps: MenuSlotProps;
  state: MenuState;
}
