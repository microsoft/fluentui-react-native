import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      backgroundColor: 'buttonBackground',
      color: 'buttonText',
      borderColor: 'buttonBorder',
      borderWidth: 1,
      borderRadius: 2,
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
          backgroundColor: 'black',
          color: 'buttonTextDisabled',
          borderColor: 'buttonBorderDisabled',
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'green',
          color: 'buttonTextHovered',
          borderColor: 'buttonBorderHovered',
        },
      },
      selected: {
        tokens: {
          backgroundColor: 'blue',
          color: 'buttonTextPressed',
          borderColor: 'buttonPressedBorder',
        },
      },
      focused: {
        tokens: {
          borderColor: 'buttonBorderFocused',
          color: 'buttonTextHovered',
          backgroundColor: 'red',
        },
      },
    },
  },
  tabsItemName,
];
