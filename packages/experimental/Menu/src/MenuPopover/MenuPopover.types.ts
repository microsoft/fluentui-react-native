import type { IViewProps } from '@fluentui-react-native/adapters';

export const menuPopoverName = 'MenuPopover';

export interface MenuPopoverProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuPopoverState {}
