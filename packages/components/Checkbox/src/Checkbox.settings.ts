import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { checkboxName, ICheckboxType } from './Checkbox.types';

export const settings: IComposeSettings<ICheckboxType> = [
  {
    tokens: {
      borderColor: 'menuItemText',
      color: 'menuItemText',
      backgroundColor: 'menuBackground'
    },
    root: {
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'checkbox',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        minHeight: 14,
        marginTop: 0,
        position: 'relative'
      }
    },
    checkbox: {
      style: {
        height: 14,
        width: 14,
        marginRight: 4,
        borderStyle: 'solid',
        borderWidth: 1,
        marginTop: 5
      }
    },
    checkmark: {
      style: {
        position: 'relative',
        opacity: 0,
        fontSize: 8,
        left: 2,
        top: -1
      }
    },
    content: {
      style: {
        fontSize: 11,
        marginTop: 1,
        borderStyle: 'dashed',
        borderColor: 'transparent',
        borderWidth: 1
      }
    },
    _precedence: ['disabled', 'boxAtEnd', 'checked', 'hovered', 'focused', 'pressed'],
    _overrides: {
      focused: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered'
        },
        content: {
          style: {
            borderColor: 'rgba(128, 128, 128, 1)'
          }
        }
      },
      checked: {
        checkmark: {
          style: {
            opacity: 1
          }
        }
      },
      hovered: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered'
        },
        _overrides: {
          checked: {
            checkmark: {
              style: {
                opacity: 1
              }
            }
          }
        }
      },
      disabled: {
        tokens: {
          borderColor: 'buttonBorderDisabled',
          color: 'disabledBodyText',
          backgroundColor: 'background'
        }
      },
      boxAtEnd: {
        checkbox: {
          style: {
            marginLeft: 4,
            marginRight: 0
          }
        }
      },
      pressed: {
        tokens: {
          backgroundColor: 'menuItemBackgroundPressed'
        }
      }
    }
  },
  checkboxName
];
