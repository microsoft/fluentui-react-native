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
      style: {
        // display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        // minHeight: 20,
        marginTop: 10,
        position: 'relative',
      },
    },
    button: {
      style: {
        backgroundColor: 'transparent',
        // top: 0,
        // left: 0,
        marginTop: 4,
        marginRight: 6,
        marginBottom: 6,
        marginLeft: 6,
      },
    },
    content: {
      variant: 'subheaderStandard',
      style: {
        marginTop: 2,
        borderStyle: 'solid',
        borderWidth: 2,
      },
    },
    _precedence: ['disabled', 'hovered', 'focused', 'selected'],
    _overrides: {
      selected: {
        tokens: {
          backgroundColor: 'buttonBackgroundPressed',
          color: 'buttonTextPressed',
          borderColor: 'buttonPressedBorder',
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
