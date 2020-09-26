import { buttonName, ButtonTokens, ButtonSlotProps, ButtonProps } from './Button.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';

export const stylingSettings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [
    (t: Theme) => ({
      backgroundColor: t.colors.buttonBackground,
      color: t.colors.buttonText,
      borderColor: t.colors.buttonBorder,
      borderWidth: 1,
      borderRadius: 2,
      disabled: {
        backgroundColor: t.colors.buttonBackgroundDisabled,
        color: t.colors.buttonTextDisabled,
        borderColor: t.colors.buttonBorderDisabled,
      },
      hovered: {
        backgroundColor: t.colors.buttonBackgroundHovered,
        color: t.colors.buttonTextHovered,
        borderColor: t.colors.buttonBorderHovered,
      },
      pressed: {
        backgroundColor: t.colors.buttonBackgroundPressed,
        color: t.colors.buttonTextPressed,
        borderColor: t.colors.buttonBorderPressed,
      },
      focused: {
        borderColor: t.colors.buttonBorderFocused,
        color: t.colors.buttonTextHovered,
      },
      primary: {
        backgroundColor: t.colors.primaryButtonBackground,
        color: t.colors.primaryButtonText,
        borderColor: t.colors.primaryButtonBorder,
        disabled: {
          backgroundColor: t.colors.primaryButtonBackgroundDisabled,
          color: t.colors.primaryButtonTextDisabled,
          borderColor: t.colors.primaryButtonBackgroundDisabled,
        },
        hovered: {
          backgroundColor: t.colors.primaryButtonBackgroundHovered,
          color: t.colors.primaryButtonTextHovered,
          borderColor: t.colors.primaryButtonBorderHovered,
        },
        pressed: {
          backgroundColor: t.colors.primaryButtonBackgroundPressed,
          color: t.colors.primaryButtonTextPressed,
          borderColor: t.colors.primaryButtonBorderPressed,
        },
        focused: {
          borderColor: t.colors.primaryButtonBorderFocused,
          backgroundColor: t.colors.primaryButtonBackgroundHovered,
          color: t.colors.primaryButtonTextHovered,
        },
      },
      ghost: {
        backgroundColor: t.colors.menuBackground,
        color: t.colors.menuItemText,
        borderColor: t.colors.menuBackground,
        disabled: {
          color: t.colors.disabledBodyText,
          borderColor: t.colors.menuBackground,
          backgroundColor: t.colors.background,
        },
        hovered: {
          backgroundColor: t.colors.menuItemBackgroundHovered,
          color: t.colors.menuItemTextHovered,
          borderColor: t.colors.menuItemBackgroundHovered,
        },
        pressed: {
          backgroundColor: t.colors.menuItemBackgroundPressed,
          borderColor: t.colors.menuItemBackgroundPressed,
        },
        focused: {
          borderColor: t.colors.focusBorder,
          backgroundColor: t.colors.menuItemBackgroundHovered,
          color: t.colors.menuItemTextHovered,
        },
      }
    }),
    buttonName,
  ],
  states: ['primary', 'ghost', 'hovered', 'focused', 'pressed', 'disabled'],
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys],
    ),
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
        justifyContent: 'center',
      },
    },
    content: buildProps(
      (tokens: ButtonTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
      }),
      ['iconColor'],
    ),
  },
};
