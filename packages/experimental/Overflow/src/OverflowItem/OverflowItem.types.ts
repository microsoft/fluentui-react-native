import type { ViewProps } from 'react-native';

import type { OverflowItemChangeHandler } from '../Overflow/Overflow.types';

export const overflowItemName = 'OverflowItem';

export interface OverflowItemCoreProps {
  overflowID: string;
  priority?: number;
  onLayout?: ViewProps['onLayout'];
  onOverflowItemChange?: OverflowItemChangeHandler;
}

export type OverflowItemProps = ViewProps & OverflowItemCoreProps;

export interface OverflowItemState {
  visible: boolean;
}

export interface OverflowItemInfo {
  props: OverflowItemProps;
  state: OverflowItemState;
}
