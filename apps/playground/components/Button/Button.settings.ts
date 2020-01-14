import { buttonName, IButtonType } from './Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'primaryButtonBackground',
      color: 'primaryButtonText',
      borderColor: 'primaryButtonBorder',
      borderWidth: 1
    },
    root: {
      style: { display: 'flex', alignItems: 'flex-start', flexDirection: 'row', alignSelf: 'flex-start' }
    },
    content: {},
    icon: {},
    stack: {
      style: {
        display: 'flex',
        paddingStart: 16,
        paddingEnd: 16,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 80,
        justifyContent: 'center'
      }
    },
    _precedence: ['pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'primaryButtonBackgroundDisabled',
          color: 'primaryButtonTextDisabled',
          borderColor: 'primaryButtonBorderDisabled'
        }
      },
      pressed: {
        tokens: {
          backgroundColor: 'primaryButtonBackgroundPressed',
          color: 'primaryButtonTextPressed',
          borderColor: 'primaryButtonBorderPressed'
        }
      }
    }
  },
  buttonName
];
