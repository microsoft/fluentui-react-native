import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { checkboxName, ICheckboxType } from './Checkbox.types';

export const checkboxSelectActionLabel = 'Toggle the Checkbox';

export const settings: IComposeSettings<ICheckboxType> = [
  {
    tokens: {
      borderColor: 'menuItemText',
      color: 'menuItemText',
      backgroundColor: 'menuBackground',
      textBorderColor: 'transparent'
    },
    root: {
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'checkbox',
      style: {
        display: 'flex',
        alignItems: 'center',
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
        marginEnd: 4,
        borderStyle: 'solid',
        borderWidth: 1
      }
    },
    checkmark: {
      style: {
        position: 'relative',
        opacity: 0,
        fontSize: 10,
        marginStart: 2,
        top: -1
      }
    },
    content: {
      variant: 'bodyStandard',
      style: {
        borderStyle: 'solid',
        borderWidth: 2,
        marginTop: 3
      }
    },
    _precedence: ['disabled', 'boxAtEnd', 'hovered', 'focused', 'pressed', 'checked'],
    _overrides: {
      focused: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          textBorderColor: 'focusBorder'
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
            marginStart: 4,
            marginEnd: 0
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
