import type { Theme } from '@fluentui-react-native/framework';
import { size160, size240, size360, size60 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  color: t.colors.neutralForeground1,
  variant: 'body1',
  paddingHorizontal: size160,
  paddingVertical: size60,
  iconColor: t.colors.neutralForeground3,
  iconSize: size240,
  marginEndForCheckedAndroid: size360,
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled1,
    iconColor: t.colors.disabledText,
  },
  gap: size160,
});
