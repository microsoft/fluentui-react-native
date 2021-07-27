import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      backgroundColor: 'transparent',
      color: 'buttonTextPressed',
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
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
      },
    } as IViewProps,
    content: {
      // accessible: false,
    },
    icon: {},
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
