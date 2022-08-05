import { radioName, RadioTokens, RadioSlotProps, RadioProps } from './Radio.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioTokens } from './RadioTokens';

const radioButtonSize = 20;
const radioButtonRadius = radioButtonSize / 2;

const radioButtonInnerCircleSize = 10;
const radioButtonInnerCircleRadius = radioButtonInnerCircleSize / 2;

export const radioButtonSelectActionLabel = 'Select a RadioButton';

export const radioStates: (keyof RadioTokens)[] = ['disabled', 'hovered', 'focused', 'selected'];

export const stylingSettings: UseStylingOptions<RadioProps, RadioSlotProps, RadioTokens> = {
  tokens: [defaultRadioTokens, radioName],
  states: radioStates,
  slotProps: {
    root: buildProps(() => ({
      accessible: true,
      focusable: true,
      accessibilityRole: 'radio',
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 20,
        marginTop: 0,
        position: 'relative',
      },
    })),
    button: buildProps(() => ({
      style: {
        backgroundColor: 'transparent',
        width: radioButtonSize,
        height: radioButtonSize,
        top: 0,
        left: 0,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: radioButtonRadius,
        marginTop: 4,
        marginRight: 6,
        marginBottom: 6,
        marginLeft: 6,
      },
    })),
    innerCircle: buildProps(() => ({
      style: {
        position: 'relative',
        opacity: 0,
        borderRadius: radioButtonInnerCircleRadius,
        height: radioButtonInnerCircleSize,
        width: radioButtonInnerCircleSize,
        left: 4,
        top: 4,
      },
    })),
    label: buildProps(() => ({
      variant: 'subheaderStandard',
      style: {
        marginTop: 2,
        borderStyle: 'solid',
        borderWidth: 2,
      },
    })),
  },
};
