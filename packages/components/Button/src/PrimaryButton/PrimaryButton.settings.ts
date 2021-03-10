import { IButtonType } from '../Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'primaryButtonBackground',
      color: 'primaryButtonText',
      borderColor: 'primaryButtonBorder',
    },
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'primaryButtonBackgroundDisabled',
          color: 'primaryButtonTextDisabled',
          borderColor: 'primaryButtonBackgroundDisabled',
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'primaryButtonBackgroundHovered',
          color: 'primaryButtonTextHovered',
          borderColor: 'primaryButtonBorderHovered',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'primaryButtonBackgroundPressed',
          color: 'primaryButtonTextPressed',
          borderColor: 'primaryButtonBorderPressed',
        },
      },
      focused: {
        tokens: {
          borderColor: 'primaryButtonBorderFocused',
          backgroundColor: 'primaryButtonBackgroundHovered',
          color: 'primaryButtonTextHovered',
        },
      },
    },
  },
  'PrimaryButton',
];
