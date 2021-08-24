import { submenuItemName, SubmenuItemType } from './SubmenuItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<SubmenuItemType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      color: 'menuItemText',
      borderColor: 'transparent',
      borderWidth: 2,
    },
    root: {
      accessible: true,
      accessibilityRole: 'menuitem',
      focusable: true,
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%',
        justifyContent: 'space-between',
      },
    },
    content: {},
    icon: {
      style: {
        marginEnd: 5,
        color: 'menuIcon'
      }
    },
    leftstack: {
      style: {
        display: 'flex',
        paddingStart: 5,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        justifyContent: 'flex-start',
      }
    },
    rightstack: {
      style: {
        display: 'flex',
        paddingEnd: 5,
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 32,
        width: 12,
        justifyContent: 'flex-end',
      }
    },
    _precedence: ['focused','hovered', 'pressed', 'submenuItemHovered', 'disabled'],
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
          color: 'menuItemTextHovered',
        },
      },
      submenuItemHovered: {
        tokens: {
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemBackgroundHovered',
        },
      },
      focused: {
        tokens: {
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemBackgroundHovered',
          borderColor: 'focusBorder'
        },
        _overrides: {
          hovered: {
            tokens: {
              borderColor: 'transparent'
            },
          },
        },
      },
    },
  },
  submenuItemName,
];
