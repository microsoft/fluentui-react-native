import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      backgroundColor: 'transparent',
      color: 'buttonText',
      borderColor: 'buttonTextPressed',
      borderWidth: 0,
      borderRadius: 0,
      fontSize: 14,
      fontWeight: 'normal',
      fontFamily: 'inherit',
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
      },
    } as IViewProps,
    content: {
      // accessible: false,
    },
    indicator: {
      style: {
        minHeight: 2,
        minWidth: 44,
        backgroundColor: '#185ABD',
      },
    },
    stack: {
      style: {
        display: 'flex',
        paddingStart: 10,
        paddingEnd: 10,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 32,
        justifyContent: 'center',
        borderWidth: 1,
        borderRadius: 2,
        backgroundColor: 'buttonBackground',
        borderColor: 'buttonBorder',
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
          backgroundColor: 'transparent',
          color: 'buttonTextHovered',
          borderColor: 'buttonBorderHovered',
          fontWeight: 'bold',
          fontFamily: 'inherit',
          fontSize: 14,
        },
      },
      selected: {
        tokens: {
          backgroundColor: 'transparent',
          color: 'buttonTextPressed',
          // borderColor: 'buttonBorderPressed',
          borderWidth: 0,
          fontWeight: 'bold',
          fontFamily: 'inherit',
          fontSize: 14,
        },
      },
      focused: {
        tokens: {
          borderColor: 'buttonBorderFocused',
          color: 'buttonTextFocused', // invalid prop?
          backgroundColor: 'transparent',
          borderWidth: 3,
        },
      },
    },
  },
  tabsItemName,
];
