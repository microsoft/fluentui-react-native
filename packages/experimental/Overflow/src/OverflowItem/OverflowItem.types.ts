import type { ViewProps } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';

export const overflowItemName = 'OverflowItem';

export interface OverflowItemCoreProps {
  overflowID: string;
  onLayout?: ViewProps['onLayout'];
}

export interface OverflowItemProps extends ButtonProps, OverflowItemCoreProps {}

export interface OverflowItemState {
  visible: boolean;
}

export interface OverflowItemInfo {
  props: OverflowItemProps;
  state: OverflowItemState;
}

export interface OverflowItemSlotProps {
  root: ButtonProps;
}

export interface OverflowItemType {
  props: OverflowItemProps;
  slotProps: OverflowItemSlotProps;
}
