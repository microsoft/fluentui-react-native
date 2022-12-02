import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    borderColor: t.colors.transparentStroke,
    borderStyle: 'solid',
    borderWidth: globalTokens.stroke.width10,
    borderRadius: globalTokens.corner.radius40,
    radioBorderWidth: globalTokens.stroke.width10,
    radioVisibility: 0,
    variant: 'subheaderStandard',
    radioBorderStyle: 'solid',
    radioBorder: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground3,
    radioSize: 20,
    radioInnerCircleSize: 10,
    labelMarginTop: globalTokens.size40 + 1,
    labelMarginRight: globalTokens.size20,
    labelMarginLeft: globalTokens.sizeNone,
    subtextVariant: 'caption1',
    subtextMarginTop: globalTokens.size20,
    subtextMarginBottom: globalTokens.size20,
    marginTop: globalTokens.size60,
    marginRight: globalTokens.size60,
    marginBottom: globalTokens.size60,
    marginLeft: globalTokens.size40,
    flexDirection: 'row',
    alignItems: 'flex-start',

    labelPositionBelow: {
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: globalTokens.sizeNone,
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
      borderColor: t.colors.focusBorder,

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
  } as RadioTokens);
