import { IButtonType } from '../Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'brandBackground',
      color: 'neutralForegroundOnBrand',
      borderColor: 'brandBackground',
    },
    // TODO - #728: neutralForegroundOnBrand is not working for icon color.
    endIcon: {
      color: '#ffffff',
    },
    startIcon: {
      color: '#ffffff',
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
          color: 'neutralForegroundOnBrand',
          borderColor: 'brandBackgroundHover',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'brandBackgroundPressed',
          color: 'neutralForegroundOnBrand',
          borderColor: 'brandBackgroundPressed',
        },
      },
      focused: {
        tokens: {
          backgroundColor: 'brandBackgroundHover',
          borderColor: 'strokeFocus2',
          color: 'neutralForegroundInvertedLinkHover',
        },
      },
    },
  },
  'PrimaryButton',
];
