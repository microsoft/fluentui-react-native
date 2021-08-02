import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settingsMacOS: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: '#616161',
      fontWeight: 'normal',
      fontFamily: 'SF Pro Text',
      fontSize: 14,
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
    _precedence: ['hovered', 'selected', 'focused', 'disabled', 'pressed'],
    _overrides: {
      disabled: {
        tokens: {
          color: '#BDBDBD',
        },
      },
      hovered: {
        tokens: {
          color: '#242424',
          indicatorColor: '#D1D1D1',
        },
      },
      selected: {
        tokens: {
          color: '#242424',
          fontWeight: 'bold',
          fontFamily: 'SF Pro Text',
          fontSize: 14,
          indicatorColor: '#0078D4',
        },
        _overrides: {
          pressed: {
            tokens: {
              indicatorColor: '#D1D1D1',
            },
          },
        },
      },

      pressed: {
        tokens: {
          color: '#242424',
          indicatorColor: '#0078D4',
        },
      },

      focused: {
        tokens: {
          color: '#242424',
          borderColor: '#242424',
          indicatorColor: '#0078D4',
        },
      },
    },
  },
  tabsItemName,
];
