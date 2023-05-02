import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { getTextMarginAdjustment } from '@fluentui-react-native/styling-utils';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';

import { input } from './Input.types';
import type { InputTokens, InputSlotProps, InputProps } from './Input.types';
import { defaultInputTokens } from './InputTokens';

export const inputStates: (keyof InputTokens)[] = ['hasIcon', 'filled', 'focused', 'typing', 'error'];

export const stylingSettings: UseStylingOptions<InputProps, InputSlotProps, InputTokens> = {
  tokens: [defaultInputTokens, input],
  states: inputStates,
  slotProps: {
    root: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        scrollEnabled: false,
        contentContainerStyle: {
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
          paddingVertical: tokens.spacingInputVertical,
          borderBottomColor: tokens.strokeColor,
          borderBottomWidth: tokens.strokeWidth,
          flex: 1,
        },
      }),
      ['strokeColor', 'strokeWidth', 'spacingInputVertical'],
    ),
    textInput: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        selectionColor: tokens.cursorColor,
        placeholderTextColor: tokens.inputTextColor,
        style: {
          ...fontStyles.from(tokens.inputTextFont, theme),
          ...getTextMarginAdjustment(),
          padding: 0, // Required to override default padding
          margin: 0, // Required to override default margin
          color: tokens.inputTextColor,
          flexShrink: 1,
          flexGrow: 1,
        },
      }),
      ['cursorColor', 'inputTextColor', 'inputTextFont', ...fontStyles.keys],
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
            paddingVertical: tokens.spacingAssistiveTextVertical,
            marginStart: tokens.spacingAssistiveTextStart,
          },
        };
      },
      ['assistiveTextColor', 'assistiveTextFont', 'spacingAssistiveTextVertical', 'spacingAssistiveTextStart', ...fontStyles.keys],
    ),
    accessoryText: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        style: {
          ...fontStyles.from(tokens.accessoryTextFont, theme),
          ...getTextMarginAdjustment(),
          marginStart: tokens.spacingInputAccessory,
          color: tokens.accessoryTextColor,
        },
      }),
      ['accessoryTextFont', 'spacingInputAccessory', 'accessoryTextColor', ...fontStyles.keys],
    ),
    accessoryIconPressable: buildProps(
      (tokens: InputTokens) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          marginStart: tokens.spacingAccessoryIconStart,
          hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
        },
      }),
      ['spacingAccessoryIconStart'],
    ),
    accessoryIcon: buildProps(
      (tokens: InputTokens) => ({
        color: tokens.accessoryIconColor,
        height: tokens.accessoryIconSize,
        width: tokens.accessoryIconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};
