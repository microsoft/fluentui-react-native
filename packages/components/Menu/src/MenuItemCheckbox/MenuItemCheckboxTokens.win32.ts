import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radiusNone,
  checkmarkPadding: globalTokens.size20,
  checkmarkSize: 16,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground1,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size200,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  iconColor: t.colors.neutralForeground1,
  iconSize: 16,
  minHeight: 24,
  minWidth: 160,
  maxWidth: 300,
  padding: globalTokens.size40,
  paddingHorizontal: globalTokens.size80,
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground1Pressed,
    iconColor: t.colors.neutralForeground1Pressed,
    checked: {
      checkmarkColor: t.colors.neutralForeground1Pressed,
      checkmarkVisibility: 1,
    },
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
    iconColor: t.colors.neutralForegroundDisabled,
    checked: {
      checkmarkColor: t.colors.neutralForegroundDisabled,
      checkmarkVisibility: 1,
    },
  },
  focused: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground1Hover,
    iconColor: t.colors.neutralForeground1Hover,
    checked: {
      checkmarkColor: t.colors.neutralForeground1Hover,
      checkmarkVisibility: 1,
    },
  },
  checked: {
    checkmarkColor: t.colors.neutralForeground1,
    checkmarkVisibility: 1,
  },
});
