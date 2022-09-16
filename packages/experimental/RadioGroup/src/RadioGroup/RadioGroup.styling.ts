import { radioGroupName, RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioGroupTokens } from './RadioGroupTokens';

export const radioGroupStates: (keyof RadioGroupTokens)[] = ['required', 'disabled'];

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
      (tokens: RadioGroupTokens) => ({
        variant: tokens.variant,
        style: {
          color: tokens.color,
        },
      }),
      ['color'],
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
