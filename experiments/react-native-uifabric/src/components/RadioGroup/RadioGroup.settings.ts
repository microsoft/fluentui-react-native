import { IComposeSettings } from '@uifabricshared/foundation-compose';
import { IRadioGroupType, radioGroupName } from './RadioGroup.types';

export const settings: IComposeSettings<IRadioGroupType> = [
  {
    tokens: {
      borderColor: 'menuItemText',
      color: 'menuItemText',
      backgroundColor: 'menuItemText'
    },
    root: {
      accessible: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column'
      }
    },
    label: {
      style: {
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: '600'
      }
    },
    _precedence: ['hovered', 'pressed', 'focused'],
    _overrides: {
      focused: {
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
  radioGroupName
];
