import { radioName, RadioTokens, RadioSlotProps, RadioProps } from './Radio.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { defaultRadioTokens } from './RadioTokens';
import { fontStyles } from '@fluentui-react-native/tokens';

export const radioStates: (keyof RadioTokens)[] = ['labelPositionBelow', 'focused', 'hovered', 'pressed', 'selected', 'disabled'];

export const stylingSettings: UseStylingOptions<RadioProps, RadioSlotProps, RadioTokens> = {
  tokens: [defaultRadioTokens, radioName],
  states: radioStates,
  slotProps: {
    root: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          display: 'flex',
          alignItems: tokens.alignItems,
          flexDirection: tokens.flexDirection,
          minHeight: 20,
          marginTop: 0,
          marginRight: globalTokens.spacing.s,
          borderRadius: tokens.borderRadius,
        },
      }),
      ['flexDirection', 'borderRadius', 'alignItems'],
    ),
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
          marginTop: tokens.marginTop,
          marginRight: tokens.marginRight,
          marginBottom: tokens.marginBottom,
          marginLeft: tokens.marginLeft,
        },
      }),
      ['radioBorderWidth', 'borderStyle', 'radioSize', 'radioBorder', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
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
    labelContent: {
      style: {
        alignSelf: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    },
    label: buildProps(
      (tokens: RadioTokens, theme: Theme) => ({
        variant: tokens.variant,
        style: {
          // marginTop: tokens.marginTop,
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['variant', 'color', ...fontStyles.keys],
    ),
    subtext: buildProps(
      (tokens: RadioTokens) => ({
        variant: tokens.subtextVariant,
        style: {
          marginTop: tokens.subtextMarginTop,
          marginRight: tokens.subtextMarginRight,
          marginBottom: tokens.subtextMarginBottom,
          color: tokens.color,
        },
      }),
      ['subtextMarginTop', 'subtextMarginRight', 'subtextMarginBottom', 'color', 'subtextVariant'],
    ),
  },
};
