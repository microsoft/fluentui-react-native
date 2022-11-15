import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderWidth: globalTokens.stroke.width15,
    checkboxBorderRadius: globalTokens.corner.radius40,
    checkboxSize: globalTokens.font.size600,
    checkmarkSize: globalTokens.font.size100,
    label: {
      color: t.colors.neutralForeground1,
      padding: globalTokens.spacing.s,
      paddingHorizontal: globalTokens.spacing.m,
      borderRadius: globalTokens.corner.radius40,
      spacingLabelAfter: globalTokens.spacing.m,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.spacing.s,
        spacingLabelAfter: 0,
      },
    },
    padding: globalTokens.spacing.xxs,
    fontSize: globalTokens.font.size200,
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    checkmarkOpacity: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled1,
    },
    checked: {
      checkboxBackgroundColor: t.colors.brandBackground,
      checkmarkOpacity: 1,
      checkboxBorderColor: t.colors.transparentStroke,
      checkboxBorderWidth: 0,
      checkmarkColor: t.colors.neutralForegroundOnColor,
      disabled: {
        checkmarkColor: t.colors.neutralForegroundOnColor,
        checkboxBackgroundColor: t.colors.brandBackgroundDisabled,
      },
    },
    circular: {
      borderRadius: globalTokens.corner.radiusCircular,
      checkboxBorderRadius: globalTokens.corner.radiusCircular,
    },
  } as CheckboxTokens);
