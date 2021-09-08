/*
Disclaimer: these styles do not follow a specific figma design, but are
meant to be placeholders until new designs are developed
*/

import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: 'bodyText',
      variant: 'bodyStandard',
      indicatorColor: 'transparent',
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'tab',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        justifyContent: 'center',
      },
    } as IViewProps,
    indicator: {
      style: {
        minHeight: 2,
        borderRadius: 2,
        marginBottom: 2,
        alignSelf: 'stretch',
        marginHorizontal: 10,
      },
    },
    stack: {
      style: {
        display: 'flex',
        marginHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 32,
        justifyContent: 'center',
      },
    },
    _precedence: ['hovered', 'selected', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          color: 'buttonTextDisabled',
          indicatorColor: 'transparent',
          fontWeight: 'normal',
        },
      },
      hovered: {
        tokens: {
          fontWeight: 'bold',
        },
        _overrides: {
          selected: {
            indicator: {
              style:{
                marginHorizontal: 0,
              },
            },
          },
        },
      },
      selected: {
        tokens: {
          indicatorColor: 'accentButtonBackground',
          fontWeight: 'bold',
        },
      },
    },
  },
  tabsItemName,
];
