import { radioGroupName, RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioGroupTokens } from './RadioGroupTokens';

export const stylingSettings: UseStylingOptions<RadioGroupProps, RadioGroupSlotProps, RadioGroupTokens> = {
  tokens: [defaultRadioGroupTokens, radioGroupName],
  slotProps: {
    root: buildProps(() => ({
      accessible: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    })),
    label: buildProps(() => ({
      style: {
        fontSize: 16,
        fontWeight: '600',
      },
    })),
  },
};
