import { buttonName, ButtonTokens, ButtonSlotProps, ButtonProps } from './Button.types';
import { ITheme, UseStylingOptions, buildProps } from '@fluentui-react-native/experimental-framework';
import { buildBorderStyle, fontStyles } from '@fluentui-react-native/tokens';

export const settings: UseStylingOptions<ButtonProps, ButtonSlotProps, ButtonTokens> = {
  tokens: [
    (t: ITheme) => ({
      backgroundColor: t.colors.buttonBackground,
      color: t.colors.buttonText,
      borderColor: t.colors.buttonBorder,
      borderWidth: 1,
      borderRadius: 2,
      disabled: {
        backgroundColor: t.colors.buttonBackgroundDisabled,
        color: t.colors.buttonTextDisabled,
        borderColor: t.colors.buttonBorderDisabled
      },
      hovered: {
        backgroundColor: t.colors.buttonBackgroundHovered,
        color: t.colors.buttonTextHovered,
        borderColor: t.colors.buttonBorderHovered as string
      },
      pressed: {
        backgroundColor: t.colors.buttonBackgroundPressed,
        color: t.colors.buttonTextPressed,
        borderColor: t.colors.buttonBorderPressed as string
      },
      focused: {
        borderColor: t.colors.buttonBorderFocused,
        color: t.colors.buttonTextHovered
      }
    }),
    buttonName
  ],
  states: ['hovered', 'focused', 'pressed', 'disabled'],
  slotProps: {
    root: buildProps(
      (tokens: ButtonTokens, theme: ITheme) => ({
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          backgroundColor: tokens.backgroundColor,
          ...buildBorderStyle.from(tokens, theme)
        }
      }),
      ['backgroundColor', ...buildBorderStyle.keys]
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
        justifyContent: 'center'
      }
    },
    content: buildProps(
      (tokens: ButtonTokens, theme: ITheme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme)
        }
      }),
      ['color', ...fontStyles.keys]
    ),
    icon: buildProps(
      (tokens: ButtonTokens) => ({
        style: {
          color: tokens.iconColor || tokens.color,
          overlayColor: tokens.iconColor
        }
      }),
      ['color', 'iconColor']
    )
  }
};
