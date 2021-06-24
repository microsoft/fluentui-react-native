import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { checkboxName, ICheckboxType } from './Checkbox.types';

export const checkboxSelectActionLabel = 'Toggle the Checkbox';

/* Default values for Win32/Windows */
export const settings: IComposeSettings<ICheckboxType> = [
  {
    tokens: {
      borderColor: 'menuItemText',
      color: 'menuItemText',
      backgroundColor: 'menuBackground',
      textBorderColor: 'transparent',
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'checkbox',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 14,
        marginTop: 0,
        position: 'relative',
      },
    },
    checkbox: {
      style: {
        borderStyle: 'solid',
        borderWidth: 1,
        minHeight: 14,
        minWidth: 14,
        marginEnd: 4,
      },
    },
    checkmark: {
      style: {
        aspectRatio: 1,
        position: 'relative',
        opacity: 0,
        fontSize: 10,
        textAlign: 'center',
        textAlignVertical: 'center',
        top: -1,
      },
    },
    content: {
      variant: 'bodyStandard',
      style: {
        borderStyle: 'solid',
        borderWidth: 2,
        marginTop: 3,
      },
    },
    _precedence: ['disabled', 'boxAtEnd', 'hovered', 'focused', 'pressed', 'checked'],
    _overrides: {
      focused: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          textBorderColor: 'focusBorder',
          checkmarkColor: 'menuItemTextHovered',
        },
      },
      checked: {
        checkmark: {
          style: {
            opacity: 1,
          },
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'menuItemBackgroundHovered',
          checkmarkColor: 'menuItemTextHovered',
        },
      },
      disabled: {
        tokens: {
          borderColor: 'buttonBorderDisabled',
          color: 'disabledBodyText',
          backgroundColor: 'background',
        },
      },
      boxAtEnd: {
        checkbox: {
          style: {
            marginStart: 4,
            marginEnd: 0,
          },
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'menuItemBackgroundPressed',
        },
      },
    },
  },
  checkboxName,
];