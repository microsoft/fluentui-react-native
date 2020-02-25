import { radioButtonName, IRadioButtonType } from './RadioButton.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

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
        width: 20,
        height: 20,
        top: 0,
        left: 0,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 50,
        marginTop: 4,
        marginRight: 6,
        marginBottom: 6,
        marginLeft: 6
      }
    },
    innerCircle: {},
    content: {
      style: {
        fontSize: 12,
        marginTop: 3,
        borderStyle: 'dashed',
        borderColor: 'transparent',
        borderWidth: 1
      }
    },
    // This still uses the innerCircle's 'hover' style instead of the 'focused' style when need be. I'm commenting out
    _precedence: ['focused', 'pressed', 'hovered'],
    _overrides: {
      focused: {
        content: {
          style: {
            borderColor: 'rgba(128, 128, 128, 1)'
          }
        },
        tokens: {
          borderColor: 'menuItemTextHovered',
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemTextHovered'
        }
      },
      hovered: {
        tokens: {
          borderColor: 'menuItemTextHovered',
          color: 'menuItemTextHovered',
          backgroundColor: 'menuItemTextHovered'
        }
      },
      pressed: {
        tokens: {
          borderColor: 'menuItemTextPressed',
          color: 'menuItemTextPressed',
          backgroundColor: 'menuItemTextPressed'
        }
      }
    }
  },
  radioButtonName
];

export const selectedStyle = {
  style: {
    position: 'relative',
    borderRadius: 50,
    height: 10,
    width: 10,
    left: 4,
    top: 4
  }
};

export const hoveredStyle = {
  style: {
    position: 'relative',
    opacity: 0.5,
    borderRadius: 50,
    height: 10,
    width: 10,
    left: 4,
    top: 4
  }
};

export const focusedStyle = {
  borderColor: 'rgba(128, 128, 128, 1)'
};
