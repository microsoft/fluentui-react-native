import type { TabListProps, TabListType } from '@fluentui-react-native/tablist';

import type { OverflowProps } from '../Overflow/Overflow.types';

export interface OverflowTabListProps extends TabListProps {
  tabKeys?: string[]; // Doubles as OverflowProps `itemIDs`
  dontHideBeforeReady?: OverflowProps['dontHideBeforeReady'];
}

export interface OverflowTabListType extends TabListType {
  props: OverflowTabListProps;
}
