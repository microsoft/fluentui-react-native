import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    borderRadius: globalTokens.corner.radius.small,
    checkboxBorderWidth: 1, // Will be update once new globalTokens for stroke is merged.
    checkboxBorderRadius: globalTokens.corner.radius.medium,
    checkboxSize: 20,
    checkmarkSize: 12,
    label: {
      padding: globalTokens.spacing.s,
      paddingHorizontal: globalTokens.spacing.m,
      borderRadius: globalTokens.corner.radius.medium,
      spacingLabelAfter: globalTokens.spacing.s,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.spacing.s,
        spacingLabelAfter: 0,
      },
    },
    padding: globalTokens.spacing.xxs,
    fontSize: globalTokens.font.size[200],
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground1,
    checkmarkOpacity: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
    },
    checked: {
      checkboxBackgroundColor: t.colors.brandBackground,
      checkboxBorderColor: t.colors.neutralStrokeAccessible,
      checkmarkOpacity: 1,
      checkmarkColor: t.colors.neutralForegroundOnColor,
      disabled: {
        checkmarkColor: t.colors.neutralForegroundOnColor,
        checkboxBackgroundColor: t.colors.brandBackgroundDisabled,
      },
    },
    circular: {
      borderRadius: globalTokens.corner.radius.circle,
      checkboxBorderRadius: globalTokens.corner.radius.circle,
    },
  } as CheckboxTokens);
