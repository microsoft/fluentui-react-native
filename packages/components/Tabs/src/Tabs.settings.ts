import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { TabsType, tabsName } from './Tabs.types';

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
      // style: {
      //   fontSize: 16,
      //   fontWeight: '600',
      // },
    },
    stack: {
      style: {
        flexDirection: 'row',
      },
    },
  },
  tabsName,
];
