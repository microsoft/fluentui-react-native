import { tooltip, TooltipTokens, TooltipSlotProps, TooltipProps } from './Tooltip.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultTooltipTokens } from './TooltipTokens';

export const tooltipStates: (keyof TooltipTokens)[] = ['small', 'medium', 'large'];

export const stylingSettings: UseStylingOptions<TooltipProps, TooltipSlotProps, TooltipTokens> = {
  tokens: [defaultTooltipTokens, tooltip],
  states: tooltipStates,
  slotProps: {
    root: buildProps(
      (tokens: TooltipTokens, theme: Theme) => ({
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
    text: buildProps(
      (tokens: TooltipTokens) => {
        return {
          style: {
            color: tokens.color,
          },
        };
      },
      ['color'],
    ),
  },
};
