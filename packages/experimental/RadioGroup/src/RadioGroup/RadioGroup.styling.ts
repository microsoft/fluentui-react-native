import { radioGroupName, RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioGroupTokens } from './RadioGroupTokens';
import { fontStyles } from '@fluentui-react-native/tokens';

export const radioGroupStates: (keyof RadioGroupTokens)[] = ['disabled'];

export const stylingSettings: UseStylingOptions<RadioGroupProps, RadioGroupSlotProps, RadioGroupTokens> = {
  tokens: [defaultRadioGroupTokens, radioGroupName],
  states: radioGroupStates,
  slotProps: {
    root: buildProps(() => ({
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    })),
    label: buildProps(() => ({
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'flex-start',
      },
    })),
    labelText: buildProps(
      (tokens: RadioGroupTokens, theme: Theme) => ({
        variant: tokens.variant,
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    required: buildProps(
      (tokens: RadioGroupTokens) => ({
        variant: tokens.variant,
        style: {
          color: tokens.requiredColor,
          paddingStart: tokens.requiredPadding,
        },
      }),
      ['requiredColor', 'requiredPadding'],
    ),
  },
};
