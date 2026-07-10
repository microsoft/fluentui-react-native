import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius40,
  size160,
  size20,
  size40,
  size60,
  size80,
  sizeNone,
  strokeWidth10,
  strokeWidth20,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    rootHorizontalPadding: size40,
    borderColor: t.colors.transparentStroke,
    borderStyle: 'solid',
    borderWidth: strokeWidth20,
    borderRadius: cornerRadius40,
    radioBorderWidth: strokeWidth10,
    radioVisibility: 0,
    variant: 'body1',
    radioBorderStyle: 'solid',
    radioBorder: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground1,
    radioOuterCircleSize: size160,
    radioInnerCircleSize: size80,
    radioOuterCircleBackground: t.colors.neutralBackground1,
    labelMarginVertical: size40,
    labelMarginRight: sizeNone,
    labelMarginLeft: sizeNone,
    subtextVariant: 'caption1',
    subtextMarginTop: sizeNone,
    subtextMarginBottom: size40 + 1,
    marginTop: size60,
    marginRight: sizeNone,
    marginBottom: size60,
    marginLeft: size40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    labelAlignItems: 'flex-start',

    labelPositionBelow: {
      flexDirection: 'column',
      alignItems: 'center',
      labelAlignItems: 'center',
      labelMarginRight: sizeNone,
      labelMarginVertical: size20,
      labelPadding: size20,
      marginLeft: size60,
      marginRight: size60,
      marginBottom: sizeNone,
    },

    disabled: {
      // Unchecked, Disabled
      radioOuterCircleBackground: t.colors.neutralBackgroundDisabled,
      radioBorder: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled,
      radioVisibility: 0,
    },

    hovered: {
      // Unchecked, Hover
      radioOuterCircleBackground: t.colors.neutralBackground1,
      radioBorder: t.colors.neutralStrokeAccessibleHover,
      color: t.colors.neutralForeground1,

      selected: {
        // Checked, Hover
        radioOuterCircleBackground: t.colors.brandBackgroundHover,
        radioBorder: t.colors.compoundBrandStroke1Hover,
        radioFill: t.colors.neutralForegroundOnBrand,
        color: t.colors.neutralForeground1,
        radioVisibility: 1,
        radioInnerCircleSize: 10,
      },
    },

    pressed: {
      // Unchecked, Pressed
      radioOuterCircleBackground: t.colors.neutralBackground1,
      radioBorder: t.colors.neutralStrokeAccessiblePressed,
      color: t.colors.neutralForeground1,

      selected: {
        // Checked, Pressed
        radioOuterCircleBackground: t.colors.brandBackgroundPressed,
        radioBorder: t.colors.compoundBrandStroke1Pressed,
        radioFill: t.colors.neutralForegroundOnBrand,
        color: t.colors.neutralForeground1,
        radioVisibility: 1,
        radioInnerCircleSize: 6,
      },
    },

    focused: {
      borderColor: t.colors.strokeFocus2,
      selected: {
        // Checked, Focused
        radioVisibility: 1,
      },
    },

    selected: {
      // Checked, Rest
      radioOuterCircleBackground: t.colors.brandBackground,
      radioBorder: t.colors.compoundBrandStroke1,
      radioFill: t.colors.neutralForegroundOnBrand,
      color: t.colors.neutralForeground1,
      radioVisibility: 1,

      disabled: {
        // Checked, Disabled
        radioFill: t.colors.neutralForegroundDisabled,
      },
    },
  }) as RadioTokens;
