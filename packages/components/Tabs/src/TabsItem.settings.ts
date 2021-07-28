import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';
// import { Text } from '@fluentui-react-native/experimental-text';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      // backgroundColor: 'transparent',
      // borderColor: 'transparent',
      // color: 'AccentDark',
      color: '#616161',
      borderWidth: 0,
      borderRadius: 0,
      fontSize: 14,
      fontWeight: 'normal',
      fontFamily: 'Segoe UI',
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'button',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        alignSelf: 'flex-start',
        justifyContent: 'center',
      },
    } as IViewProps,
    content: {
      // accessible: false,
    },
    indicator: {
      style: {
        minHeight: 2,
        minWidth: 44,
        // flex: 1,
        backgroundColor: '#185ABD',
        borderRadius: 2,
        // paddingTop: 5,
        // borderWidth: 1,
        marginBottom: 2,
      },
    },
    stack: {
      style: {
        display: 'flex',
        // paddingStart: 10,
        // paddingEnd: 10,
        // paddingBottom: 50,
        marginHorizontal: 10,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 32,
        justifyContent: 'center',
        // borderWidth: 1,
        // borderRadius: 2,
        // backgroundColor: 'buttonBackground',
        // borderColor: 'buttonBorder',
      },
    },
    _precedence: ['hovered', 'selected', 'focused', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'buttonBackgroundDisabled',
          color: 'buttonTextDisabled',
          borderColor: 'buttonBorderDisabled',
        },
      },
      hovered: {
        tokens: {
          // backgroundColor: 'transparent',
          color: '#242424',
          // borderColor: 'buttonBorderHovered',
          // fontWeight: 'bold',
          // fontFamily: 'LargeSemibold',
          fontWeight: 'bold',
          fontFamily: 'Segoe UI',
          fontSize: 14,
        },
      },
      selected: {
        tokens: {
          // backgroundColor: 'transparent',
          color: '#242424',
          // borderColor: 'buttonBorderPressed',
          fontWeight: 'bold',
          fontFamily: 'Segoe UI',
          fontSize: 14,
        },
        // stack: {
        //   style: {
        //     borderWidth: 3,
        //     borderColor: 'buttonBorderPressed',
        //   },
        // },
      },
      focused: {
        tokens: {
          // borderColor: 'buttonBorderFocused',
          color: '#242424',
          borderWidth: 2,
          borderColor: '#242424',
          borderRadius: 4,
          // backgroundColor: 'transparent',
          // borderWidth: 0,
        },
        // stack: {
        // style: {
        // borderWidth: 2,
        // borderColor: '#242424',
        // },
        // },
      },
    },
  },
  tabsItemName,
];
