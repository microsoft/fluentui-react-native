import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';

import type { RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { radioGroupName } from './RadioGroup.types';
import { defaultRadioGroupTokens } from './RadioGroupTokens';

export const radioGroupStates: (keyof RadioGroupTokens)[] = ['isHorizontal', 'disabled'];

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
    options: buildProps(
      (tokens: RadioGroupTokens) => ({
        style: {
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          flexDirection: tokens.flexDirection,
        },
      }),
      ['flexDirection'],
    ),
  },
};
