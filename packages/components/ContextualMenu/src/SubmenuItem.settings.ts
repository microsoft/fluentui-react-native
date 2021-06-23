import { submenuItemName, SubmenuItemType } from './SubmenuItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<SubmenuItemType> = [
  {
    tokens: {
      backgroundColor: 'menuBackground',
      color: 'menuItemText',
      borderColor: 'transparent',
      borderWidth: 1
    },
    root: {
      accessible: true,
      accessibilityRole: 'menuitem',
      focusable: true,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%'
      }
    },
    content: {},
    icon: {style: { marginEnd: 5 }},
    leftstack: {
      style: {
        display: 'flex',
        paddingStart: 5,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        width: '80%',
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
        width: '20%',
        justifyContent: 'flex-end',
      }
    },
    _precedence: ['focused', 'hovered', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'menuBackground',
          color: 'disabledText',
        }
      },
      pressed: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          color: 'menuItemTextHovered',
        }
      },
      focused: {
        tokens: {
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemBackgroundHovered',
        },
        _overrides: {
          disabled: {
            tokens: {
              borderColor: 'focusBorder'
            }
          },
          hovered: {
            _overrides: {
              disabled: {
                tokens: {
                  borderColor: 'transparent'
                }
              }
            }
          }
        }
      }
    }
  },
  submenuItemName
];
