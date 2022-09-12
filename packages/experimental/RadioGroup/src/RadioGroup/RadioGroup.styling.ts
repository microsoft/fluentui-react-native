import { radioGroupName, RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioGroupTokens } from './RadioGroupTokens';

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
    label: buildProps(
      (tokens: RadioGroupTokens) => ({
        variant: tokens.variant,
        style: {
          color: tokens.color,
        },
      }),
      ['color'],
    ),
  },
};
