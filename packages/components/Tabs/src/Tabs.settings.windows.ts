import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { TabsType, tabsName } from './Tabs.types';

export const settings: IComposeSettings<TabsType> = [
  {
    tokens: {
      color: 'menuItemText',
      variant: 'bodySemibold',
      fontWeight: 'bold',
      fontSize: 14,
    },
    root: {
      accessible: true,
      accessibilityRole: 'tablist',
    },
    stack: {
      style: {
        flexDirection: 'row',
        marginTop: 6,
      },
    },
    label: {
      style: {
        marginStart: 10,
      },
    },
  },
  tabsName,
];
