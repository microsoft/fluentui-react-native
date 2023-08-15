import * as React from 'react';

import type { TabListContextData } from './TabList.types';

export const TabListContext = React.createContext<TabListContextData>({
  selectedKey: '',
});
