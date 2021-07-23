import { tabsItemName, TabsItemType } from './TabsItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const tabsItemSelectActionLabel = 'Select a TabsItem';

export const settings: IComposeSettings<TabsItemType> = [
  {
    tokens: {
      borderColor: 'menuItemText',
      color: 'menuItemText',
      backgroundColor: 'menuItemText',
      textBorderColor: 'transparent',
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'tab',
      style: {},
    },
    button: {
      style: {
        borderColor: 'blue',
        //borderBottomWidth: 10,
      },
    },
    content: {
      variant: 'subheaderStandard',
      style: {},
    },
    _precedence: ['disabled', 'hovered', 'focused', 'selected'],
    _overrides: {
      selected: {
        tokens: {
          backgroundColor: 'buttonBackgroundPressed',
          color: 'buttonTextPressed',
          borderColor: 'blue',
          borderBottomWidth: 5,
        },
      },
      focused: {
        tokens: {
          textBorderColor: 'focusBorder',
        },
      },
      disabled: {
        tokens: {
          borderColor: 'buttonBorderDisabled',
          color: 'disabledBodyText',
          backgroundColor: 'background',
        },
      },
    },
  },
  tabsItemName,
];
