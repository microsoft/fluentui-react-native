import type { TabProps, TabTokens } from '@fluentui-react-native/tablist';

import type { OverflowItemCoreProps } from '../OverflowItem/OverflowItem.types';

export interface OverflowTabProps extends TabProps, OverflowItemCoreProps {}
export interface OverflowTabSlotProps {
  root: TabProps;
}
export interface OverflowTabType {
  props: OverflowTabProps;
  slotProps: OverflowTabSlotProps;
  tokens: TabTokens;
}
