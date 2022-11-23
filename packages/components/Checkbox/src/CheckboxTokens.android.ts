import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from './Checkbox.types';

// No Tokens for Sizes , hovered, pressed and circular checkbox as they're not supported for Android Platform

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderWidth: globalTokens.stroke.width15,
    checkboxBorderRadius: globalTokens.corner.radius40,
    checkboxSize: globalTokens.font.size600,
    checkmarkSize: globalTokens.font.size100,
    label: {
      color: t.colors.neutralForeground1,
      padding: globalTokens.size120,
      paddingHorizontal: globalTokens.size160,
      borderRadius: globalTokens.corner.radius40,
      spacingLabelAfter: globalTokens.size160,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.size120,
        spacingLabelAfter: 0,
      },
    },
    padding: globalTokens.size40,
    fontSize: t.typography.sizes.body,
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    checkmarkOpacity: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled1,
    },
    checked: {
      checkboxBackgroundColor: t.colors.brandBackground,
      checkmarkOpacity: 1,
      checkboxBorderWidth: globalTokens.stroke.widthNone,
      checkmarkColor: t.colors.neutralForegroundOnColor,
      disabled: {
        checkboxBackgroundColor: t.colors.brandBackgroundDisabled,
      },
    },
  } as CheckboxTokens);
