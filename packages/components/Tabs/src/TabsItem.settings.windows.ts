import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: 'buttonText',
      variant: 'heroStandard',
      fontSize: 20,
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: 4,
      indicatorColor: 'transparent',
    },
    root: {
      accessible: true,
      focusable: false,
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
        opacity: 0.6,
      },
    },
    _precedence: ['selected', 'hovered', 'disabled'],
    _overrides: {
      disabled: {
        stack: {
          style:{
            opacity: 0.2,
          },
        },
      },
      hovered: {
        stack: {
          style:{
            opacity: 0.8,
          },
        },
      },
      selected: {
        tokens: {
          indicatorColor: 'brandStroke1',
        },
        stack: {
          style:{
            opacity: 1,
          },
        },
      },
    },
  },
  tabsItemName,
];
