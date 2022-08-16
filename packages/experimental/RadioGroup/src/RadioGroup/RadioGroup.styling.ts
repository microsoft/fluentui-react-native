import { radioGroupName, RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioGroupTokens } from './RadioGroupTokens';
import { fontStyles } from '@fluentui-react-native/tokens';

export const stylingSettings: UseStylingOptions<RadioGroupProps, RadioGroupSlotProps, RadioGroupTokens> = {
  tokens: [defaultRadioGroupTokens, radioGroupName],
  slotProps: {
    root: buildProps(() => ({
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    })),
    label: buildProps(
      (tokens: RadioGroupTokens, theme: Theme) => ({
        style: {
          ...fontStyles.from(tokens, theme),
        },
      }),
      [...fontStyles.keys],
    ),
  },
};
