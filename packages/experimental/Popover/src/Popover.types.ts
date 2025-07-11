import type { IViewProps } from '@fluentui-react-native/adapters';

export const popoverName = 'Popover';
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyInterface = {};

export type PopoverTokens = EmptyInterface;

export type PopoverProps = Omit<IViewProps, 'onPress'>;

export type PopoverState = EmptyInterface;

export type PopoverSlotProps = EmptyInterface;

export type PopoverType = {
  props: PopoverProps;
  tokens: PopoverTokens;
  slotProps: PopoverSlotProps;
  state: PopoverState;
};
