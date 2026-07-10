import type { Theme } from '@fluentui-react-native/framework';
import { size120, size160, size40, size80, strokeWidth05 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { InputTokens } from './Input.types';

export const defaultInputTokens: TokenSettings<InputTokens, Theme> = (t: Theme) =>
  ({
    iconSize: 24,
    hasIcon: {
      //spacingIconContent + iconSize
      spacingAssistiveTextStart: size160 + 24,
      spacingLabelStart: size160 + 24,
    },
    spacingIconContent: size160,
    paddingHorizontal: size160,
    spacingInputVertical: size120,
    spacingAssistiveTextVertical: size40,
    spacingLabelTop: size120,
    spacingInputAccessory: size80,
    spacingAccessoryIconStart: size80,
    spacingAssistiveTextStart: 0,
    spacingLabelStart: 0,
    accessoryIconSize: 24,
    strokeWidth: strokeWidth05,

    backgroundColor: t.colors.neutralBackground1,
    strokeColor: t.colors.neutralStroke1,
    iconColor: t.colors.neutralForeground2,
    accessoryIconColor: t.colors.neutralForeground2,
    variant: 'caption2', //label font
    color: t.colors.neutralForeground2, //label color
    assistiveTextColor: t.colors.neutralForeground2,
    assistiveTextFont: { variant: 'caption2' },
    inputTextFont: { variant: 'body1' },
    inputTextColor: t.colors.neutralForeground2,
    accessoryTextFont: { variant: 'body1' },
    accessoryTextColor: t.colors.neutralForeground2,

    error: {
      backgroundColor: t.colors.neutralBackground1,
      strokeColor: t.colors.dangerForeground1,
      iconColor: t.colors.neutralForeground2,
      accessoryIconColor: t.colors.neutralForeground2,
      color: t.colors.dangerForeground1, //label color
      assistiveTextColor: t.colors.dangerForeground1,
      inputTextColor: t.colors.neutralForeground1,
      accessoryTextColor: t.colors.neutralForeground2,
      cursorColor: t.colors.neutralForeground3,
    },

    focused: {
      backgroundColor: t.colors.neutralBackground1,
      strokeColor: t.colors.brandStroke1,
      iconColor: t.colors.brandForeground1,
      accessoryIconColor: t.colors.neutralForeground2,
      color: t.colors.brandForeground1, //label color
      assistiveTextColor: t.colors.neutralForeground2,
      inputTextColor: t.colors.neutralForeground2,
      accessoryTextColor: t.colors.neutralForeground2,
      cursorColor: t.colors.neutralForeground3,
    },

    filled: {
      backgroundColor: t.colors.neutralBackground1,
      strokeColor: t.colors.neutralStroke1,
      iconColor: t.colors.neutralForeground2,
      accessoryIconColor: t.colors.neutralForeground2,
      color: t.colors.neutralForeground2, // label color
      assistiveTextColor: t.colors.neutralForeground2,
      inputTextColor: t.colors.neutralForeground1,
      accessoryTextColor: t.colors.neutralForeground2,
    },

    typing: {
      backgroundColor: t.colors.neutralbackground1,
      strokeColor: t.colors.brandStroke1,
      iconColor: t.colors.brandForeground1,
      accessoryIconColor: t.colors.neutralForeground2,
      color: t.colors.brandForeground1, // label color
      assistiveTextColor: t.colors.neutralForeground2,
      inputTextColor: t.colors.neutralForeground1,
      accessoryTextColor: t.colors.neutralForeground2,
      cursorColor: t.colors.neutralForeground3,
    },
  }) as InputTokens;
