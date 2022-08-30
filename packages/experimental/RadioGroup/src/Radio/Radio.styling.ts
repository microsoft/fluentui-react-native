import { radioName, RadioTokens, RadioSlotProps, RadioProps } from './Radio.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioTokens } from './RadioTokens';

const radioSize = 20;
const radioRadius = radioSize / 2;

const radioInnerCircleSize = 10;
const radioInnerCircleRadius = radioInnerCircleSize / 2;

export const radioSelectActionLabel = 'Select a RadioButton';

export const radioStates: (keyof RadioTokens)[] = ['focused', 'hovered', 'pressed', 'selected', 'disabled'];

export const stylingSettings: UseStylingOptions<RadioProps, RadioSlotProps, RadioTokens> = {
  tokens: [defaultRadioTokens, radioName],
  states: radioStates,
  slotProps: {
    root: buildProps(() => ({
      style: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 20,
        marginTop: 0,
        position: 'relative',
      },
    })),
    button: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          backgroundColor: 'transparent',
          width: radioSize,
          height: radioSize,
          top: 0,
          left: 0,
          borderWidth: 1,
          borderStyle: 'solid',
          borderRadius: radioRadius,
          borderColor: tokens.radioBorder,
          marginTop: 4,
          marginRight: 6,
          marginBottom: 6,
          marginLeft: 6,
        },
      }),
      ['radioBorder'],
    ),
    innerCircle: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          position: 'relative',
          opacity: tokens.radioVisibility,
          borderRadius: radioInnerCircleRadius,
          height: radioInnerCircleSize,
          width: radioInnerCircleSize,
          backgroundColor: tokens.radioFill,
          left: 4,
          top: 4,
        },
      }),
      ['radioVisibility', 'radioFill'],
    ),
    label: buildProps(
      (tokens: RadioTokens) => ({
        variant: tokens.variant,
        style: {
          marginTop: 2,
          borderStyle: 'solid',
          borderColor: tokens.textBorderColor,
          borderWidth: tokens.borderWidth,
          color: tokens.labelColor,
        },
      }),
      ['textBorderColor', 'borderWidth', 'labelColor'],
    ),
  },
};
