import * as React from 'react';

import type { TabListContextData } from './TabList.types';

const nullFunction = () => null;

export const TabListContext = React.createContext<TabListContextData>({
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
