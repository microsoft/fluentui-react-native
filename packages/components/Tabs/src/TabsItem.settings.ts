import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      color: 'buttonText',
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
          // backgroundColor: 'black',
          color: 'buttonTextDisabled',
          borderColor: 'buttonBorderDisabled',
        },
      },
      hovered: {
        tokens: {
          // backgroundColor: 'green',
          color: 'buttonTextHovered',
          borderColor: 'buttonBorderHovered',
        },
      },
      selected: {
        tokens: {
          // backgroundColor: 'blue',
          color: 'buttonTextPressed',
          borderColor: 'buttonPressedBorder',
        },
      },
      focused: {
        tokens: {
          borderColor: 'buttonBorderFocused',
          color: 'buttonTextHovered',
          // backgroundColor: 'red',
        },
      },
    },
  },
  tabsItemName,
];
