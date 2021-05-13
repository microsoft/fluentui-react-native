import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { checkboxName, ICheckboxType } from './Checkbox.types';

export const checkboxSelectActionLabel = 'Toggle the Checkbox';

export const settings: IComposeSettings<ICheckboxType> = [
  {
    tokens: {
      borderColor: 'buttonDisabledContent',
      checkmarkColor: 'buttonPressedContent',
      backgroundColor: 'transparent',
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
        minHeight: 18,
        marginTop: 0,
        position: 'relative',
      },
    },
    checkbox: {
      style: {
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 2,
        minHeight: 18,
        minWidth: 18,
        marginEnd: 4,
      },
    },
    checkmark: {
      style: {
        aspectRatio: 1,
        minHeight: 18,
        minWidth: 18,
        fontSize: 12,
        textAlign: 'center',
        textAlignVertical: 'center',
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
          backgroundColor: 'buttonBackground',
          checkmarkColor: 'buttonPressedContent',
        },
      },
      checked: {
        tokens: {
          borderColor: 'buttonBackground',
          backgroundColor: 'buttonBackground',
        },
        checkmark: {
          style: {
            opacity: 1,
          },
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'buttonBackground',
          checkmarkColor: 'buttonPressedContent',
        },
      },
      disabled: {
        tokens: {
          borderColor: 'buttonDisabledContent',
          backgroundColor: 'buttonBackgroundDisabled',
          checkmarkColor: 'buttonPressedContent',
        },
        checkbox: {
          style: {
            opacity: 0.38,
          },
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
          backgroundColor: 'buttonBackgroundPressed',
        },
      },
    },
  },
  checkboxName,
];
