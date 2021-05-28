import { radioButtonName, IRadioButtonType } from './RadioButton.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

const radioButtonSize = 20;
const radioButtonRadius = radioButtonSize / 2;

const radioButtonInnerCircleSize = 10;
const radioButtonInnerCircleRadius = radioButtonInnerCircleSize / 2;

export const radioButtonSelectActionLabel = 'Select a RadioButton';

export const settings: IComposeSettings<IRadioButtonType> = [
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
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 20,
        marginTop: 0,
        position: 'relative',
      },
    },
    button: {
      style: {
        backgroundColor: 'transparent',
        width: radioButtonSize,
        height: radioButtonSize,
        top: 0,
        left: 0,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: radioButtonRadius,
        marginTop: 4,
        marginRight: 6,
        marginBottom: 6,
        marginLeft: 6,
      },
    },
    innerCircle: {
      style: {
        position: 'relative',
        opacity: 0,
        borderRadius: radioButtonInnerCircleRadius,
        height: radioButtonInnerCircleSize,
        width: radioButtonInnerCircleSize,
        left: 4,
        top: 4,
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
        innerCircle: {
          style: {
            opacity: 1,
          },
        },
      },
      focused: {
        tokens: {
          textBorderColor: 'focusBorder',
        },
      },
      hovered: {
        innerCircle: {
          style: {
            opacity: 0.5,
          },
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
  radioButtonName,
];
