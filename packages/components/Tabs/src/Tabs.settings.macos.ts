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
      style: {
        marginLeft: 7,
      },
    },
    label: {
      style: {},
    },
    stack: {
      style: {
        marginLeft: -11,
        marginTop: 6,
        flexDirection: 'row',
      },
    },
  },
  tabsName,
];