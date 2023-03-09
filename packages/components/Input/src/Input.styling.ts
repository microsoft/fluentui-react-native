import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';

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
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    inputWrapper: buildProps(
      (tokens: InputTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    icon: buildProps(
      (tokens: InputTokens) => ({
        color: tokens.iconColor,
        height: tokens.iconSize,
        width: tokens.iconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
    dismissIcon: buildProps(
      (tokens: InputTokens) => ({
        color: tokens.dismissIconColor,
        height: tokens.dismissIconSize,
        width: tokens.dismissIconSize,
      }),
      ['iconColor', 'iconSize'],
    ),
  },
};
