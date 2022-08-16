import { radioGroupName, RadioGroupTokens, RadioGroupSlotProps, RadioGroupProps } from './RadioGroup.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioGroupTokens } from './RadioGroupTokens';
// import { fontStyles } from '@fluentui-react-native/tokens';

export const stylingSettings: UseStylingOptions<RadioGroupProps, RadioGroupSlotProps, RadioGroupTokens> = {
  tokens: [defaultRadioGroupTokens, radioGroupName],
  slotProps: {
    root: buildProps(() => ({
      // accessible: true,
      // accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    })),
    label: buildProps(
      () => ({
        // tokens: RadioGroupTokens, theme: Theme
        style: {
          fontSize: 16,
          fontWeight: '600',
          // ...fontStyles.from(tokens, theme),
        },
      }),
      // [...fontStyles.keys],
    ),
  },
};
