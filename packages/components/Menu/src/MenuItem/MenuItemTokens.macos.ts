import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';
import type { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.transparentBackground,
  borderRadius: 5, // hardcoded for now to match NSMenu
  checkmarkSize: 16,
  color: t.colors.menuItemText, // hardcoded for now to match NSMenu
  fontFamily: t.typography.families.primary,
  fontSize: 13, // aligning with NSMenu font size
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  paddingHorizontal: 5, // hardcoded for now to match NSMenu
  paddingVertical: 3, // hardcoded for now to match NSMenu
  submenuIndicatorColor: t.colors.neutralForeground2,
  submenuIndicatorPadding: 2, // hardcoded for now to match NSMenu,
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
