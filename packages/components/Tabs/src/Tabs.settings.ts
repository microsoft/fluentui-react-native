import type { IComposeSettings } from '@uifabricshared/foundation-compose';

import type { TabsType } from './Tabs.types';
import { tabsName } from './Tabs.types';

export const settings: IComposeSettings<TabsType> = [
  {
    tokens: {
      color: 'menuItemText',
    },
    root: {
      accessible: true,
      accessibilityRole: 'tablist',
    },
    label: {
      variant: 'subheaderSemibold',
    },
    stack: {
      style: {
        flexDirection: 'row',
      },
    },
  },
  tabsName,
];
