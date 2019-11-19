import { IButtonType } from './Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'buttonBackground',
      color: 'buttonText',
      borderColor: 'buttonBorder',
      borderWidth: 1,
      fontSize: 'large',
      fontWeight: 'semiBold',
      fontFamily: 'primary'
    },
    root: {
      style: {
        boxSizing: 'border-box',
        borderRadius: 2,
        borderStyle: 'solid',
        borderWidth: 1,
        cursor: 'pointer',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 100,
        overflow: 'hidden',
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8
      }
    },
    content: {},
    icon: {},
    _precedence: ['disabled', 'hovered', 'pressed', 'focused'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'buttonBackgroundDisabled',
          color: 'buttonTextDisabled',
          borderColor: 'buttonBorderDisabled'
        }
      },
      hovered: {
        tokens: {
          backgroundColor: 'buttonBackgroundHovered',
          color: 'buttonTextHovered',
          borderColor: 'buttonBorderHovered'
        }
      },
      pressed: {
        tokens: {
          backgroundColor: 'buttonBackgroundPressed',
          color: 'buttonTextPressed',
          borderColor: 'buttonBorderPressed'
        }
      },
      focused: {
        tokens: {
          borderColor: 'inputFocusBorderAlt'
        }
      }
    }
  },
  'RNFButton'
];
