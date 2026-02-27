import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    rootHorizontalPadding: globalTokens.size40,
    borderColor: t.colors.transparentStroke,
    borderStyle: 'solid',
    borderWidth: globalTokens.stroke.width20,
    borderRadius: globalTokens.corner.radius40,
    radioBorderWidth: globalTokens.stroke.width10,
    radioVisibility: 0,
    variant: 'body1',
    radioBorderStyle: 'solid',
    radioBorder: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground1,
    radioOuterCircleSize: globalTokens.size160,
    radioInnerCircleSize: globalTokens.size80,
    radioOuterCircleBackground: t.colors.neutralBackground1,
    labelMarginVertical: globalTokens.size40,
    labelMarginRight: globalTokens.sizeNone,
    labelMarginLeft: globalTokens.sizeNone,
    subtextVariant: 'caption1',
    subtextMarginTop: globalTokens.sizeNone,
    subtextMarginBottom: globalTokens.size40 + 1,
    marginTop: globalTokens.size60,
    marginRight: globalTokens.sizeNone,
    marginBottom: globalTokens.size60,
    marginLeft: globalTokens.size40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    labelAlignItems: 'flex-start',

    labelPositionBelow: {
      flexDirection: 'column',
      alignItems: 'center',
      labelAlignItems: 'center',
      labelMarginRight: globalTokens.sizeNone,
      labelMarginVertical: globalTokens.size20,
      labelPadding: globalTokens.size20,
      marginLeft: globalTokens.size60,
      marginRight: globalTokens.size60,
      marginBottom: globalTokens.sizeNone,
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
