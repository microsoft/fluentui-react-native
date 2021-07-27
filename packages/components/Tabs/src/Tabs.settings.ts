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
      style: {},
    },
    label: {
      style: {
        fontFamily: 'inherit',
        fontSize: 16,
        fontWeight: '600',
      },
    },
    container: {
      style: {
        flexDirection: 'row',
      },
    },
  },
  tabsName,
];
