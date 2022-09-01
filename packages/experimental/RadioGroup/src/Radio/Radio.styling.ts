import { radioName, RadioTokens, RadioSlotProps, RadioProps } from './Radio.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultRadioTokens } from './RadioTokens';
import { borderStyles } from '@fluentui-react-native/tokens';

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
      },
    })),
    button: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          backgroundColor: 'transparent',
          width: tokens.radioSize,
          height: tokens.radioSize,
          top: 0,
          left: 0,
          borderWidth: tokens.radioBorderWidth,
          borderStyle: tokens.borderStyle,
          borderRadius: tokens.radioSize / 2,
          borderColor: tokens.radioBorder,
          marginTop: 4,
          marginRight: 6,
          marginBottom: 6,
          marginLeft: 6,
        },
      }),
      ['radioBorderWidth', 'borderStyle', 'radioSize', 'radioBorder'],
    ),
    innerCircle: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          opacity: tokens.radioVisibility,
          borderRadius: tokens.radioInnerCircleSize / 2,
          height: tokens.radioInnerCircleSize,
          width: tokens.radioInnerCircleSize,
          backgroundColor: tokens.radioFill,
          left: 4,
          top: 4,
        },
      }),
      ['radioInnerCircleSize', 'radioVisibility', 'radioFill'],
    ),
    label: buildProps(
      (tokens: RadioTokens, theme: Theme) => ({
        variant: tokens.variant,
        style: {
          marginTop: 2,
          ...borderStyles.from(tokens, theme),
          color: tokens.color,
        },
      }),
      [...borderStyles.keys, 'color'],
    ),
  },
};
