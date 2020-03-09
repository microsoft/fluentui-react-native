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
      backgroundColor: 'menuItemText'
    },
    root: {
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        minHeight: 20,
        marginTop: 0,
        position: 'relative'
      }
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
        marginLeft: 6
      }
    },
    innerCircle: {
      style: {
        position: 'relative',
        opacity: 0,
        borderRadius: radioButtonInnerCircleRadius,
        height: radioButtonInnerCircleSize,
        width: radioButtonInnerCircleSize,
        left: 4,
        top: 4
      }
    },
    content: {
      style: {
        fontSize: 12,
        marginTop: 3,
        borderStyle: 'dashed',
        borderColor: 'transparent',
        borderWidth: 1
      }
    },
    // This still uses the innerCircle's 'hover' style instead of the 'focused' style when need be. I'm commenting out'
    _precedence: ['disabled', 'hovered', 'selected'],
    _overrides: {
      selected: {
        innerCircle: {
          style: {
            opacity: 1
          }
        },
        content: {
          style: {
            borderColor: 'rgba(128, 128, 128, 1)'
          }
        }
      },
      hovered: {
        innerCircle: {
          style: {
            opacity: 0.5
          }
        }
      },
      disabled: {
        tokens: {
          borderColor: 'buttonBorderDisabled',
          color: 'disabledBodyText',
          backgroundColor: 'background'
        }
      }
    }
  },
  radioButtonName
];
