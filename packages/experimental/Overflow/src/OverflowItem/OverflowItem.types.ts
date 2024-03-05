import type { ViewProps } from 'react-native';

import type { OverflowItemChangeHandler } from '../Overflow/Overflow.types';

export const overflowItemName = 'OverflowItem';

export interface OverflowItemCoreProps {
  // Unique ID assigned to the item
  overflowID: string;
  // Priority of item. Greater priority value means item will stay visible longer vs other items
  priority?: number;
  // Callback for RN onLayout event
  onLayout?: ViewProps['onLayout'];
  // Callback that runs whenever this item's visibility changes or whenever its dimensions should be manually set
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
