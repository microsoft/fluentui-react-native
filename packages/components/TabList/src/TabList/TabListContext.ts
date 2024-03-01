import * as React from 'react';

import type { TabListState } from './TabList.types';

const nullFunction = () => null;

export const TabListContext = React.createContext<TabListState>({
  addTabKey: nullFunction,
  appearance: 'transparent',
  canShowAnimatedIndicator: false,
  disabled: false,
  onTabSelect: nullFunction,
  removeTabKey: nullFunction,
  selectedKey: '',
  setFocusedTabRef: nullFunction,
  size: 'small',
  tabKeys: [],
  vertical: false,
  updateDisabledTabs: nullFunction,
  updateTabRef: nullFunction,
});
