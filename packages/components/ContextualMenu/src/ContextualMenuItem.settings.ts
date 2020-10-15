import { contextualMenuItemName, ContextualMenuItemType } from './ContextualMenuItem.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<ContextualMenuItemType> = [
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
      // Since ViewProps does not support this prop, force the prop against type checking
      ...{ acceptsKeyboardFocus: true },
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        width: '100%'
      }
    },
    content: {},
    icon: {},
    stack: {
      style: {
        display: 'flex',
        paddingStart: 16,
        paddingEnd: 16,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 80,
        justifyContent: 'center'
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
  contextualMenuItemName
];
