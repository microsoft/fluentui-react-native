import { shadow, ShadowTokens, ShadowSlotProps, ShadowProps } from './Shadow.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultShadowTokens } from './ShadowTokens';

export const shadowStates: (keyof ShadowTokens)[] = ['small', 'medium', 'large'];

export const stylingSettings: UseStylingOptions<ShadowProps, ShadowSlotProps, ShadowTokens> = {
  tokens: [defaultShadowTokens, shadow],
  states: shadowStates,
  slotProps: {
    root: buildProps(
      (tokens: ShadowTokens, theme: Theme) => ({
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
      (tokens: ShadowTokens) => {
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
