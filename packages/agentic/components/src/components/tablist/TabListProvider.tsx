import type * as React from 'react';

import { TabListContext } from './TabListContext';
import type { TabListContextValue } from './TabListContext';

type TabListProviderProps = {
  children: React.ReactNode;
  value: TabListContextValue;
};

export function TabListProvider({ children, value }: TabListProviderProps) {
  return <TabListContext.Provider value={value}>{children}</TabListContext.Provider>;
}
