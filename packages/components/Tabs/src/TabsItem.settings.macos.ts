import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: '#616161',
      // fontWeight: 'normal',
      // fontFamily: 'Arial',
      // fontSize: 14
      variant: 'bodyStandard',
      fontSize: 13,
      borderWidth: 2,
      borderRadius: 4,
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
    _precedence: ['hovered', 'selected', 'focused', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          color: '#BDBDBD',
          indicatorColor: 'transparent'
        },
      },
      hovered: {
        tokens: {
          color: 'pink',
          indicatorColor: 'labelColor',
        },
      },
      selected: {
        tokens: {
          color: '#242424',
          // fontWeight: 'bold',
          // fontFamily: 'SF Pro Text',
          // fontSize: 14,
          indicatorColor: 'labelColor',
        },
      },
    },
  },
  tabsItemName,
];
