import { IButtonType } from '../Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'brandBackground',
      color: 'neutralForegroundInverted',
      borderColor: 'brandBackground',
    },
    // TODO: neutralForegroundInverted is not working for icon color.
    trailingIcon: {
      color: '#fff',
    },
    icon: {
      color: '#fff',
    },
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'neutralBackgroundDisabled',
          color: 'neutralForegroundDisabled',
          borderColor: 'neutralBackgroundDisabled',
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'brandBackgroundHover',
          color: 'neutralForegroundInverted',
          borderColor: 'brandBackgroundHover',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'brandBackgroundPressed',
          color: 'neutralForegroundInverted',
          borderColor: 'brandBackgroundPressed',
        },
      },
      focused: {
        tokens: {
          backgroundColor: 'brandBackgroundHover',
          borderColor: 'neutralForegroundInverted',
          color: 'neutralForegroundInvertedHover',
        },
      },
    },
  },
  'PrimaryButton',
];
