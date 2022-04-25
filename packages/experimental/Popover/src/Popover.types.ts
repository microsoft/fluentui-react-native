import type { IViewProps } from '@fluentui-react-native/adapters';

export const popoverName = 'Popover';

export interface PopoverTokens {}

export interface PopoverProps extends Omit<IViewProps, 'onPress'> {}

export interface PopoverState {}

export interface PopoverSlotProps {}

export interface PopoverType {
  props: PopoverProps;
  tokens: PopoverTokens;
  slotProps: PopoverSlotProps;
  state: PopoverState;
}
