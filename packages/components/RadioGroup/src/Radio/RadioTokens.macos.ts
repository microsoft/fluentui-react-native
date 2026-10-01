import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius40,
  size100,
  size20,
  size200,
  size40,
  size60,
  sizeNone,
  strokeWidth10,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    rootHorizontalPadding: size40,
    borderColor: t.colors.transparentStroke,
    borderStyle: 'solid',
    borderWidth: strokeWidth10,
    borderRadius: cornerRadius40,
    radioBorderWidth: strokeWidth10,
    radioVisibility: 0,
    variant: 'subheaderStandard',
    radioBorderStyle: 'solid',
    radioBorder: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground3,
    radioOuterCircleSize: size200,
    radioInnerCircleSize: size100,
    labelMarginVertical: size40,
    labelMarginRight: size20,
    labelMarginLeft: sizeNone,
    subtextVariant: 'caption1',
    subtextMarginTop: sizeNone,
    subtextMarginBottom: size40 + 1,
    marginTop: size60,
    marginRight: size60,
    marginBottom: size60,
    marginLeft: size40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    labelAlignItems: 'flex-start',

    labelPositionBelow: {
      flexDirection: 'column',
      alignItems: 'center',
      labelAlignItems: 'center',
      labelMarginLeft: size20,
      marginLeft: size60,
    },

    disabled: {
      // Unchecked, Disabled
      radioBorder: t.colors.neutralForegroundDisabled,
      color: t.colors.neutralForegroundDisabled,
      radioVisibility: 0,
    },

    hovered: {
      // Unchecked, Hover
      radioBorder: t.colors.neutralStrokeAccessibleHover,
      color: t.colors.neutralForeground2,

      selected: {
        // Checked, Hover
        radioBorder: t.colors.compoundBrandStroke1Hover,
        radioFill: t.colors.compoundBrandBackground1Hover,
        color: t.colors.neutralForeground2,
        radioVisibility: 1,
      },
    },

    pressed: {
      // Unchecked, Pressed
      radioBorder: t.colors.neutralStrokeAccessiblePressed,
      color: t.colors.neutralForeground1,

      selected: {
        // Checked, Pressed
        radioBorder: t.colors.compoundBrandStroke1Pressed,
        radioFill: t.colors.compoundBrandBackground1Pressed,
        color: t.colors.neutralForeground1,
        radioVisibility: 1,
      },
    },

    focused: {
      selected: {
        // Checked, Focused
        radioVisibility: 1,
      },
    },

    selected: {
      // Checked, Rest
      radioBorder: t.colors.compoundBrandStroke1,
      radioFill: t.colors.compoundBrandStroke1,
      color: t.colors.neutralForeground3,
      radioVisibility: 1,

      disabled: {
        // Checked, Disabled
        radioFill: t.colors.neutralForegroundDisabled,
      },
    },
  }) as RadioTokens;
