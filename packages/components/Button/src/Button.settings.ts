import { buttonName, IButtonType } from './Button.types';
import { IComposeSettings } from '@uifabricshared/foundation-compose';
import type { IViewProps } from '@fluentui-react-native/adapters';

export const settings: IComposeSettings<IButtonType> = [
  {
    tokens: {
      backgroundColor: 'buttonBackground',
      color: 'buttonText',
      borderColor: 'buttonBorder',
      borderWidth: 1,
      borderRadius: 2,
    },
    root: {
      accessible: true,
      focusable: true,
      accessibilityRole: 'button',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'row',
        alignSelf: 'flex-start',
      },
    } as IViewProps,
    content: {
      // accessible: false,
    },
    icon: {},
    stack: {
      style: {
        display: 'flex',
        paddingStart: 10,
        paddingEnd: 10,
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        minHeight: 32,
        minWidth: 32,
        justifyContent: 'center',
      },
    },
    _precedence: ['hovered', 'focused', 'pressed', 'disabled'],
    _overrides: {
      disabled: {
        tokens: {
          backgroundColor: 'buttonBackgroundDisabled',
          color: 'buttonTextDisabled',
          borderColor: 'buttonBorderDisabled',
        },
      },
      hovered: {
        tokens: {
          backgroundColor: 'buttonBackgroundHovered',
          color: 'buttonTextHovered',
          borderColor: 'buttonBorderHovered',
        },
      },
      pressed: {
        tokens: {
          backgroundColor: 'buttonBackgroundPressed',
          color: 'buttonTextPressed',
          borderColor: 'buttonPressedBorder',
        },
      },
      focused: {
        tokens: {
          borderColor: 'buttonBorderFocused',
          color: 'buttonTextHovered',
          backgroundColor: 'buttonBackgroundHovered',
        },
      },
    },
  },
  buttonName,
];
