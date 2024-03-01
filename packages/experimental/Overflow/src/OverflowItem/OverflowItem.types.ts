import type { ViewProps } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';

import type { OverflowItemChangeHandler } from '../Overflow/Overflow.types';

export const overflowItemName = 'OverflowItem';

export interface OverflowItemCoreProps {
  overflowID: string;
  priority?: number;
  onLayout?: ViewProps['onLayout'];
  onOverflowItemChange?: OverflowItemChangeHandler;
}

export type OverflowItemProps<T = ViewProps> = T & OverflowItemCoreProps;

export interface OverflowItemState {
  visible: boolean;
}

export interface OverflowItemInfo<T = ViewProps> {
  props: OverflowItemProps<T>;
  state: OverflowItemState;
}

export interface OverflowItemSlotProps<T = ButtonProps> {
  root: T;
}

export interface OverflowItemType<T = ButtonProps> {
  props: OverflowItemProps<T>;
  slotProps: OverflowItemSlotProps<T>;
}
