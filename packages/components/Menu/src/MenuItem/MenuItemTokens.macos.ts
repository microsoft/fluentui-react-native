import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.transparentBackground,
  borderRadius: 5, // hardcoded for now to match ContextualMenu
  checkmarkSize: 16,
  color: t.colors.menuItemText, // matches ContextualMenu
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size300,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.spacing.xs,
  paddingHorizontal: 5, // hardcoded for now to match ContextualMenu
  paddingVertical: 3, // hardcoded for now to match ContextualMenu
  submenuIndicatorPadding: globalTokens.spacing.none,
  submenuIndicatorSize: 16,
  focused: {
    backgroundColor: t.colors.menuItemBackgroundHovered,
    color: t.colors.menuItemTextHovered,
  },
  pressed: {
    backgroundColor: t.colors.menuItemBackgroundPressed,
    color: t.colors.menuItemTextHovered,
  },
  disabled: {
    backgroundColor: t.colors.menuBackground,
    color: t.colors.disabledText,
  },
});
