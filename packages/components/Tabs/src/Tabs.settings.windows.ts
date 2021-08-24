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
      style: {
        marginLeft: 10,
      },
    },
    stack: {
      style: {
        flexDirection: 'row',
        marginLeft: -14,
        marginTop: 6,
      },
    },
  },
  tabsName,
];
