import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius40,
  checkmarkPadding: globalTokens.sizeNone,
  checkmarkSize: 16,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size300,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  minHeight: 32,
  minWidth: 160,
  maxWidth: 300,
  padding: globalTokens.size60,
  hovered: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground2Hover,
    checked: {
      checkmarkColor: t.colors.neutralForeground2Hover,
      checkmarkVisibility: 1,
    },
  },
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground2Pressed,
    checked: {
      checkmarkColor: t.colors.neutralForeground2Pressed,
      checkmarkVisibility: 1,
    },
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
    checked: {
      checkmarkColor: t.colors.neutralForegroundDisabled,
      checkmarkVisibility: 1,
    },
  },
  checked: {
    checkmarkColor: t.colors.neutralForeground2,
    checkmarkVisibility: 1,
  },
});
