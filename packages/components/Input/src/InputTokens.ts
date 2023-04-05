import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { InputTokens } from './Input.types';

export const defaultInputTokens: TokenSettings<InputTokens, Theme> = (t: Theme) =>
  ({
    iconSize: 24,
    hasIcon: {
      //spacingIconContent + iconSize
      spacingAssistiveTextStart: 16 + 24,
      spacingLabelStart: 16 + 24,
    },
    spacingIconContent: 16,
    paddingHorizontal: 16,
    spacingInputVertical: 12,
    spacingAssistiveTextVertical: 4,
    spacingLabelTop: 12,
    spacingInputSecondary: 8,
    spacingAccessoryIconStart: 8,
    spacingAssistiveTextStart: 0,
    spacingLabelStart: 0,
    accessoryIconSize: 24,
    strokeWidth: globalTokens.stroke.width05,

    backgroundColor: t.colors.neutralBackground1,
    strokeColor: t.colors.neutralStroke1,
    iconColor: t.colors.neutralForeground2,
    accessoryIconColor: t.colors.neutralForeground2,
    variant: 'caption2', //label font
    color: t.colors.neutralForeground2, //label color
    assistiveTextColor: t.colors.neutralForeground2,
    assistiveTextFont: 'caption2',
    inputTextFont: 'body1',
    inputTextColor: t.colors.neutralForeground2,
    secondaryTextFont: 'body1',
    secondaryTextColor: t.colors.neutralForeground2,

    error: {
      backgroundColor: t.colors.neutralBackground1,
      strokeColor: t.colors.dangerForeground1,
      iconColor: t.colors.neutralForeground2,
      accessoryIconColor: t.colors.neutralForeground2,
      color: t.colors.dangerForeground1, //label color
      assistiveTextColor: t.colors.dangerForeground1,
      inputTextColor: t.colors.neutralForeground1,
      secondaryTextColor: t.colors.neutralForeground2,
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
      secondaryTextColor: t.colors.neutralForeground2,
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
      secondaryTextColor: t.colors.neutralForeground2,
    },

    typing: {
      backgroundColor: t.colors.neutralbackground1,
      strokeColor: t.colors.brandStroke1,
      iconColor: t.colors.brandForeground1,
      accessoryIconColor: t.colors.neutralForeground2,
      color: t.colors.brandForeground1, // label color
      assistiveTextColor: t.colors.neutralForeground2,
      inputTextColor: t.colors.neutralForeground1,
      secondaryTextColor: t.colors.neutralForeground2,
      cursorColor: t.colors.neutralForeground3,
    },
  } as InputTokens);
