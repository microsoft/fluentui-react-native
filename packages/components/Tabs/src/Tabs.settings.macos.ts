/*
Disclaimer: these styles do not follow a specific figma design, but are
meant to be placeholders until new designs are developed
*/

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
        marginLeft: 4,
      },
    },
    label: {
      style: {},
    },
    stack: {
      style: {
        // marginLeft: -10,
        marginTop: 6,
        flexDirection: 'row',
      },
      // tokens: {
      //   childrenGap: 10,
      // },
    },
  },
  tabsName,
];
