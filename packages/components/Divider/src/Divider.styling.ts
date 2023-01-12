import { divider, DividerTokens, DividerSlotProps, DividerProps } from './Divider.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultDividerTokens } from './DividerTokens';

export const dividerStates: (keyof DividerTokens)[] = ['small', 'medium', 'large'];

export const stylingSettings: UseStylingOptions<DividerProps, DividerSlotProps, DividerTokens> = {
  tokens: [defaultDividerTokens, divider],
  states: dividerStates,
  slotProps: {
    root: buildProps(
      (tokens: DividerTokens, theme: Theme) => ({
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
      (tokens: DividerTokens) => {
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
