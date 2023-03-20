import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  color: t.colors.neutralForeground1,
  variant: 'body1',
  paddingHorizontal: 16,
  paddingVertical: 6,
  iconColor: t.colors.neutralForeground3,
  iconSize: globalTokens.size240,
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.menuItemTextHovered,
    iconColor: t.colors.menuItemTextHovered,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled1,
    iconColor: t.colors.disabledText,
  },
  gap: globalTokens.size160,
});
