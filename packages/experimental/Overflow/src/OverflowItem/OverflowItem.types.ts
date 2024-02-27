import type { ViewProps } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';

export const overflowItemName = 'OverflowItem';

export interface OverflowItemCoreProps {
  overflowID: string;
  priority?: number;
  onLayout?: ViewProps['onLayout'];
}

export type OverflowItemProps<T = ButtonProps> = T & OverflowItemCoreProps;

export interface OverflowItemState {
  visible: boolean;
}

export interface OverflowItemInfo<T = ButtonProps> {
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
