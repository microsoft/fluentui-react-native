import { radioButtonName, IRadioButtonType } from './RadioButton.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { ViewProps } from 'react-native';

export const settings: IComposeSettings<IRadioButtonType> = [
  {
    root: {
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 20,
        marginTop: 0,
        position: 'relative'
      }
    } as ViewProps,
    button: {
      style: {
        backgroundColor: 'transparent',
        width: 20,
        height: 20,
        top: 0,
        left: 0,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'black',
        borderRadius: 50,
        marginTop: 4,
        marginRight: 6,
        marginBottom: 6,
        marginLeft: 6,
        position: 'relative'
      }
    },
    innerCircle: {},
    content: {
      style: {
        fontSize: 12,
        marginTop: 3,
        borderStyle: 'dashed',
        borderColor: 'rgba(128, 128, 128, 0)',
        borderWidth: 1
      }
    },
    _precedence: ['hovered', 'pressed', 'focused'],
    _overrides: {
      focused: {},
      hovered: {},
      pressed: {}
    }
  },
  radioButtonName
];

export const selectedStyle = {
  style: {
    position: 'relative',
    borderRadius: 50,
    backgroundColor: 'black',
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
    backgroundColor: 'black',
    height: 10,
    width: 10,
    left: 4,
    top: 4
  }
};

export const focusedStyle = {
  borderColor: 'rgba(128, 128, 128, 1)'
};
