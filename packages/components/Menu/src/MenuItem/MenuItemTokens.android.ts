import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  color: t.colors.neutralForeground1,
  variant: 'body1',
  paddingHorizontal: globalTokens.size160,
  paddingVertical: globalTokens.size60,
  iconColor: t.colors.neutralForeground3,
  iconSize: globalTokens.size240,
  marginEndForCheckedAndroid: globalTokens.size360,
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled1,
    iconColor: t.colors.disabledText,
  },
  gap: globalTokens.size160,
});
