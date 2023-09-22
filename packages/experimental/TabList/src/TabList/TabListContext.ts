import * as React from 'react';

import type { TabListState } from './TabList.types';

const nullFunction = () => null;

export const TabListContext = React.createContext<TabListState>({
  addTabKey: nullFunction,
  appearance: 'transparent',
  disabled: false,
  onTabSelect: nullFunction,
  removeTabKey: nullFunction,
  selectedKey: '',
  setSelectedTabRef: nullFunction,
  size: 'small',
  tabKeys: [],
  vertical: false,
});
