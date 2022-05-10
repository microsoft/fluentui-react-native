import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius.none,
  color: t.colors.neutralForeground1,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size[200],
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  minHeight: 24,
  minWidth: 160,
  maxWidth: 300,
  padding: globalTokens.spacing.xs,
  paddingHorizontal: globalTokens.spacing.s,
  hovered: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground1Hover,
  },
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
  },
});
