import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';

import { input } from './Input.types';
import type { InputTokens, InputSlotProps, InputProps } from './Input.types';
import { defaultInputTokens } from './InputTokens';

export const stylingSettings: UseStylingOptions<InputProps, InputSlotProps, InputTokens> = {
  tokens: [defaultInputTokens, input],
  slotProps: {
    root: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          backgroundColor: tokens.backgroundColor,
          paddingHorizontal: tokens.paddingHorizontal,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'paddingHorizontal', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    inputWrapper: {
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
        justifyContent: 'center',
      },
    },
    input: buildProps(
      (tokens: InputTokens) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          marginVertical: tokens.spacingInputVertical,
        },
      }),
      ['spacingInputVertical'],
    ),
    textInput: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        style: {
          ...fontStyles.from(tokens.inputTextFont, theme),
          ...getTextMarginAdjustment(),
          padding: 0, // Required to override default padding
          margin: 0, // Required to override default margin
        },
      }),
      ['inputTextFont', ...fontStyles.keys],
    ),
    secondaryText: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        style: {
          ...fontStyles.from(tokens.inputTextFont, theme),
          ...getTextMarginAdjustment(),
          marginStart: tokens.spacingInputSecondary,
        },
      }),
      ['inputTextFont', 'spacingInputSecondary', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: InputTokens) => ({
        color: tokens.iconColor,
        height: tokens.iconSize,
        width: tokens.iconSize,
        style: {
          marginEnd: tokens.spacingIconContent,
        },
      }),
      ['iconSize', 'iconColor', 'spacingIconContent'],
    ),
    dismissIcon: buildProps(
      (tokens: InputTokens) => ({
        color: tokens.dismissIconColor,
        height: tokens.dismissIconSize,
        width: tokens.dismissIconSize,
        style: {
          marginStart: tokens.spacingDismissIconStart,
        },
      }),
      ['iconColor', 'iconSize', 'spacingDismissIconStart'],
    ),
    label: buildProps(
      (tokens: InputTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens, theme),
            ...getTextMarginAdjustment(),
            color: tokens.color,
            marginTop: tokens.spacingLabelTop,
            marginStart: tokens.spacingLabelStart,
          },
        };
      },
      ['color', 'spacingLabelTop', ...fontStyles.keys],
    ),
    assistiveText: buildProps(
      (tokens: InputTokens, theme: Theme) => {
        return {
          style: {
            ...fontStyles.from(tokens.assistiveTextFont, theme),
            ...getTextMarginAdjustment(),
            color: tokens.assistiveTextColor,
            marginVertical: tokens.spacingAssistiveTextVertical,
            marginStart: tokens.spacingAssistiveTextStart,
          },
        };
      },
      ['assistiveTextColor', 'assistiveTextFont', 'spacingAssistiveTextVertical', 'spacingAssistiveTextStart', ...fontStyles.keys],
    ),
  },
};
