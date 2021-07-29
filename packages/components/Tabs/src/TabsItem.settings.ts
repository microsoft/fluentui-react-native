import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';
// import { Text } from '@fluentui-react-native/experimental-text';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: '#616161',
      fontWeight: 'normal',
      fontFamily: 'Segoe UI',
      borderWidth: 0,
      borderRadius: 0,
      fontSize: 14,
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
        // flex: 1,
        minHeight: 2,
        minWidth: 44,
        backgroundColor: 'transparent',
        borderRadius: 2,
        marginBottom: 2,
      },
    },
    stack: {
      style: {
        // backgroundColor: '#FAFAFA',
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
    _precedence: ['hovered', 'pressed', 'selected', 'focused', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          // backgroundColor: 'buttonBackgroundDisabled',
          color: '#BDBDBD',
          // borderColor: 'buttonBorderDisabled',
        },
      },
      hovered: {
        tokens: {
          color: '#242424',
          // fontWeight: 'bold',
          // fontFamily: 'Segoe UI',
          // fontSize: 14,
        },
        indicator: {
          style: {
            backgroundColor: '#D1D1D1',
          },
        },
      },
      selected: {
        tokens: {
          color: '#242424',
          fontWeight: 'bold',
          fontFamily: 'Segoe UI',
          fontSize: 14,
        },
      },
      pressed: {
        tokens: {
          color: '#242424',
        },
        indicator: {
          style: {
            backgroundColor: '#0078D4',
          },
        },
      },
      focused: {
        tokens: {
          color: '#242424',
          borderWidth: 2,
          borderColor: '#242424',
          borderRadius: 4,
        },
        indicator: {
          style: {
            backgroundColor: '#0078D4',
          },
        },
      },
    },
  },
  tabsItemName,
];
