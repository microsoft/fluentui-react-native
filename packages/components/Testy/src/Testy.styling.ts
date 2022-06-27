import { testy, TestyTokens, TestySlotProps, TestyProps } from './Testy.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultTestyTokens } from './TestyTokens';

export const testyStates: (keyof TestyTokens)[] = ['small', 'medium', 'large'];

export const stylingSettings: UseStylingOptions<TestyProps, TestySlotProps, TestyTokens> = {
  tokens: [defaultTestyTokens, testy],
  states: testyStates,
  slotProps: {
    root: buildProps(
      (tokens: TestyTokens, theme: Theme) => ({
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
      (tokens: TestyTokens) => {
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
