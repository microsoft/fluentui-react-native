import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    borderColor: t.colors.transparentStroke,
    borderStyle: 'solid',
    borderWidth: globalTokens.stroke.width.thin,
    borderRadius: globalTokens.corner.radius.medium,
    radioBorderWidth: globalTokens.stroke.width.thin,
    radioVisibility: 0,
    variant: 'subheaderStandard',
    radioBorderStyle: 'solid',
    radioBorder: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground3,
    radioSize: 20,
    radioInnerCircleSize: 10,
    labelMarginTop: globalTokens.spacing.none,
    labelMarginRight: globalTokens.spacing.xxs,
    labelMarginLeft: globalTokens.spacing.none,
    subtextVariant: 'caption1',
    subtextMarginTop: globalTokens.spacing.xxs,
    subtextMarginBottom: globalTokens.spacing.xxs,
    marginTop: globalTokens.spacing.xs,
    marginRight: globalTokens.spacing.sNudge,
    marginBottom: globalTokens.spacing.sNudge,
    marginLeft: globalTokens.spacing.sNudge,
    flexDirection: 'row',
    alignItems: 'flex-start',

    labelPositionBelow: {
      flexDirection: 'column',
      alignItems: 'center',
      marginLeft: globalTokens.spacing.xs,
      labelMarginLeft: globalTokens.spacing.xs,
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
