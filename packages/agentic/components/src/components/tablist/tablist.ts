import { renderTabList_unstable } from './renderTabList';
import type { TabListProps } from './tablist.types';
import { useTabList_unstable } from './useTabList';
import { useTabListStyles_unstable } from './useTabListStyles';

export function TabList(props: TabListProps) {
  const state = useTabList_unstable(props);
  useTabListStyles_unstable(state);
  return renderTabList_unstable(state);
}

TabList.displayName = 'TabList';
