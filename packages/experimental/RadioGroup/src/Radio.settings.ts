import { radioName, RadioType } from './Radio.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

const radioSize = 20;
const radioRadius = radioSize / 2;

const radioInnerCircleSize = 10;
const radioInnerCircleRadius = radioInnerCircleSize / 2;

export const radioSelectActionLabel = 'Select a Radio';

export const settings: IComposeSettings<RadioType> = [
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
        width: radioSize,
        height: radioSize,
        top: 0,
        left: 0,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: radioRadius,
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
        borderRadius: radioInnerCircleRadius,
        height: radioInnerCircleSize,
        width: radioInnerCircleSize,
        left: 4,
        top: 4,
      },
    },
    label: {
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
  radioName,
];
