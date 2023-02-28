import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { borderStyles, buildProps, fontStyles, layoutStyles } from '@fluentui-react-native/framework';

import type { OptionProps, OptionSlotProps, OptionTokens } from './Option.types';
import { optionName } from './Option.types';
import { defaultOptionTokens } from './OptionTokens';

export const optionStates: (keyof OptionTokens)[] = ['hovered', 'focused', 'pressed', 'disabled'];

export const stylingSettings: UseStylingOptions<OptionProps, OptionSlotProps, OptionTokens> = {
  tokens: [defaultOptionTokens, optionName],
  states: optionStates,
  slotProps: {
    root: buildProps(
      (tokens: OptionTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          alignSelf: 'flex-start',
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          flexDirection: 'row',
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    checkIcon: buildProps(
      (tokens: OptionTokens) => ({
        color: tokens.checkmarkColor,
        height: tokens.checkmarkSize,
        viewBox: '0 0 ' + tokens.checkmarkSize + ' ' + tokens.checkmarkSize,
        width: tokens.checkmarkSize,
      }),
      ['checkmarkColor', 'checkmarkSize'],
    ),
    label: buildProps(
      (tokens: OptionTokens, theme: Theme) => ({
        color: tokens.color,
        style: {
          ...fontStyles.from(tokens, theme),
          marginStart: tokens.spacingContentIcon,
        },
      }),
      ['color', 'spacingContentIcon', ...fontStyles.keys],
    ),
  },
};
