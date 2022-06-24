import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius.none,
  checkmarkSize: 16,
  submenuIndicatorPadding: globalTokens.spacing.xxs,
  submenuIndicatorSize: 16,
  color: t.colors.neutralForeground1,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size[200],
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.spacing.xs,
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
  focused: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground1Hover,
  },
});
