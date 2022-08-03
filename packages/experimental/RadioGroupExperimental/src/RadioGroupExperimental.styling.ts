import { radioGroupExperimental, RadioGroupExperimentalTokens, RadioGroupExperimentalSlotProps, RadioGroupExperimentalProps } from './RadioGroupExperimental.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultRadioGroupExperimentalTokens } from './RadioGroupExperimentalTokens';

export const radioGroupExperimentalStates: (keyof RadioGroupExperimentalTokens)[] = ['small', 'medium', 'large'];

export const stylingSettings: UseStylingOptions<RadioGroupExperimentalProps, RadioGroupExperimentalSlotProps, RadioGroupExperimentalTokens> = {
  tokens: [defaultRadioGroupExperimentalTokens, radioGroupExperimental],
  states: radioGroupExperimentalStates,
  slotProps: {
    root: buildProps(
      (tokens: RadioGroupExperimentalTokens, theme: Theme) => ({
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
      (tokens: RadioGroupExperimentalTokens) => {
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
