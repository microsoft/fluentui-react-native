import type { IViewProps } from '@fluentui-react-native/adapters';

export const menuName = 'Menu';

export interface MenuProps extends Omit<IViewProps, 'onPress'> {
  open?: boolean;
}

export interface MenuState extends MenuProps {
  setOpen: (isOpen: boolean) => void;
}
