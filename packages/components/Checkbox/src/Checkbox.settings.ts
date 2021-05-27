import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { checkboxName, ICheckboxType } from './Checkbox.types';

export const checkboxSelectActionLabel = 'Toggle the Checkbox';

export const settings: IComposeSettings<ICheckboxType> = [
  {
    tokens: {
      backgroundColor: 'transparent',
      textBorderColor: 'transparent',
      borderColor: 'checkboxBorderColor',
      checkmarkVisibility: 0,
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
      width: 14,
      height: 10,
      style: {
        marginVertical: 2,
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
          backgroundColor: 'checkboxBackground',
          checkmarkColor: 'checkboxBackground',
        },
      },
      checked: {
        tokens: {
          borderColor: 'checkboxBackground',
          backgroundColor: 'checkboxBackground',
          checkmarkVisibility: 1,
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'checkboxBackground',
          checkmarkColor: 'checkboxBackground',
        },
      },
      disabled: {
        tokens: {
          backgroundColor: 'checkboxBackgroundDisabled',
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
          backgroundColor: 'checkboxBackground',
        },
      },
    },
  },
  checkboxName,
];
