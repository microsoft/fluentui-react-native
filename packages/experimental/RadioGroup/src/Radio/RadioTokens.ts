import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { RadioTokens } from './Radio.types';

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    borderColor: t.colors.menuItemText,
    color: t.colors.menuItemText,
    backgroundColor: t.colors.menuItemText,
    textBorderColor: t.colors.transparentStroke, // 'transparent'
    radioVisibility: 0,
    variant: 'subheaderStandard',
    // Unchecked, Rest
    radioBorder: t.colors.neutralStrokeAccessible,
    labelColor: t.colors.neutralForeground3,
    disabled: {
      // Unchecked, Disabled
      radioBorder: t.colors.neutralForegroundDisabled,
      labelColor: t.colors.neutralForegroundDisabled,
      selected: {
        // Checked, Disabled
        radioFill: t.colors.neutralForegroundDisabled,
        radioVisibility: 1,
      },
    },
    hovered: {
      // Unchecked, Hover
      radioBorder: t.colors.neutralStrokeAccessibleHover,
      labelColor: t.colors.neutralForeground2,
      selected: {
        // Checked, Hover
        radioBorder: t.colors.compoundBrandStroke1Hover,
        radioFill: t.colors.compoundBrandBackground1Hover,
        labelColor: t.colors.neutralForeground2,
        radioVisibility: 1,
      },
    },
    pressed: {
      // Unchecked, Pressed
      radioBorder: t.colors.neutralStrokeAccessiblePressed,
      labelColor: t.colors.neutralForeground1,
      selected: {
        // Checked, Pressed
        radioBorder: t.colors.compoundBrandStroke1Pressed,
        radioFill: t.colors.compoundBrandBackground1Pressed,
        labelColor: t.colors.neutralForeground1,
        radioVisibility: 1,
      },
    },
    focused: {
      textBorderColor: t.colors.focusBorder,
    },
    selected: {
      // Checked, Rest
      radioBorder: t.colors.compoundBrandStroke1,
      radioFill: t.colors.compoundBrandStroke1,
      labelColor: t.colors.neutralForeground3,
      radioVisibility: 1,
    },
  } as RadioTokens);
