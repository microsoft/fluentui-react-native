import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { TabsType, tabsName } from './Tabs.types';

export const settings: IComposeSettings<TabsType> = [
  {
    tokens: {
      color: 'menuItemText',
      variant: 'subheaderSemibold',
    },
    root: {
      accessible: true,
      // accessibilityRole: 'tablist', // Add role when RN is at >= 0.64
      style: {
        marginLeft: 10,
      },
    },
    label: {
      style: {
        // marginLeft: 10,
        // fontFamily: 'inherit',
        // fontSize: 16,
        // fontWeight: '600',
        // variant: 'subheaderSemibold',
      },
    },
    container: {
      style: {
        flexDirection: 'row',
        marginLeft: -10,
      },
    },
  },
  tabsName,
];
