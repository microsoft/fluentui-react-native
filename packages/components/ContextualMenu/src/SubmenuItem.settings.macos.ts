import { submenuItemName, SubmenuItemType } from './SubmenuItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<SubmenuItemType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      borderColor: 'transparent',
      borderWidth: 2,
      chevronColor: 'black',
      color: 'menuItemText',
    },
    root: {
      accessible: true,
      accessibilityRole: 'menuitem',
      enableFocusRing: false,
      focusable: true,
      style: {
        display: 'flex',
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'space-between',
        borderRadius: 5,
      },
    },
    content: {},
    icon: {
      style: {
        marginEnd: 5,
        color: 'menuIcon',
      },
    },
    leftstack: {
      style: {
        display: 'flex',
        flex: 1,
        paddingStart: 5,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
      },
    },
    rightstack: {
      style: {
        display: 'flex',
        flex: 1,
        paddingEnd: 5,
        alignItems: 'center',
        flexDirection: 'row',
        width: 12,
        justifyContent: 'flex-end',
      },
    },
    _precedence: ['focused', 'hovered', 'pressed', 'submenuItemHovered', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'menuBackground',
          color: 'disabledText',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'menuItemBackgroundPressed',
        },
      },
      focused: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          chevronColor: 'white',
          color: 'white',
        },
      },
      submenuItemHovered: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          chevronColor: 'white',
          color: 'white',
        },
      },
    },
  },
  submenuItemName,
];
