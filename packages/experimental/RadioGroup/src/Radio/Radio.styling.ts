import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { fontStyles, borderStyles } from '@fluentui-react-native/tokens';

import type { RadioTokens, RadioSlotProps, RadioProps } from './Radio.types';
import { radioName } from './Radio.types';
import { defaultRadioTokens } from './RadioTokens';

export const radioStates: (keyof RadioTokens)[] = ['labelPositionBelow', 'focused', 'hovered', 'pressed', 'selected', 'disabled'];

export const stylingSettings: UseStylingOptions<RadioProps, RadioSlotProps, RadioTokens> = {
  tokens: [defaultRadioTokens, radioName],
  states: radioStates,
  slotProps: {
    root: buildProps(
      (tokens: RadioTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: tokens.alignItems,
          flexDirection: tokens.flexDirection,
          paddingHorizontal: tokens.rootHorizontalPadding,
          paddingVertical: tokens.rootVerticalPadding,
          ...borderStyles.from(tokens, theme),
        },
        android_ripple: { color: tokens.rippleColor },
      }),
      ['flexDirection', 'rootHorizontalPadding', 'rootVerticalPadding', 'rippleColor', 'alignItems', ...borderStyles.keys],
    ),
    button: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          backgroundColor: 'transparent',
          width: tokens.radioOuterCircleSize,
          height: tokens.radioOuterCircleSize,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: tokens.radioBorderWidth,
          borderStyle: tokens.radioBorderStyle,
          borderRadius: tokens.radioOuterCircleSize / 2,
          borderColor: tokens.radioBorder,
          marginTop: tokens.marginTop,
          marginRight: tokens.marginRight,
          marginBottom: tokens.marginBottom,
          marginLeft: tokens.marginLeft,
        },
        android_ripple: { color: tokens.rippleColor, radius: tokens.rippleRadius, borderless: true },
      }),
      [
        'radioBorderWidth',
        'radioBorderStyle',
        'radioOuterCircleSize',
        'rippleColor',
        'rippleRadius',
        'radioBorder',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
      ],
    ),
    innerCircle: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          opacity: tokens.radioVisibility,
          borderRadius: tokens.radioInnerCircleSize / 2,
          height: tokens.radioInnerCircleSize,
          width: tokens.radioInnerCircleSize,
          backgroundColor: tokens.radioFill,
        },
      }),
      ['radioInnerCircleSize', 'radioVisibility', 'radioFill'],
    ),
    labelContent: buildProps(
      (tokens: RadioTokens) => ({
        style: {
          alignItems: tokens.labelAlignItems,
          flexDirection: 'column',
          marginRight: tokens.labelMarginRight,
          marginLeft: tokens.labelMarginLeft,
          padding: tokens.labelPadding,
        },
      }),
      ['labelAlignItems', 'labelMarginRight', 'labelMarginLeft', 'labelPadding'],
    ),
    label: buildProps(
      (tokens: RadioTokens, theme: Theme) => ({
        variant: tokens.variant,
        style: {
          marginTop: tokens.labelMarginTop,
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['variant', 'labelMarginTop', 'color', ...fontStyles.keys],
    ),
    subtext: buildProps(
      (tokens: RadioTokens) => ({
        variant: tokens.subtextVariant,
        style: {
          marginTop: tokens.subtextMarginTop,
          marginBottom: tokens.subtextMarginBottom,
          color: tokens.color,
        },
      }),
      ['subtextMarginTop', 'subtextMarginBottom', 'color', 'subtextVariant'],
    ),
  },
};
