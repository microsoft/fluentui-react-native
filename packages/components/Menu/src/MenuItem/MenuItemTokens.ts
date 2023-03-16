import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius40,
  checkmarkSize: 16,
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size300,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  iconColor: t.colors.neutralForeground2,
  iconSize: 16,
  minHeight: 32,
  minWidth: 128,
  maxWidth: 300,
  padding: globalTokens.size60,
  submenuIndicatorColor: t.colors.neutralForeground2,
  submenuIndicatorPadding: globalTokens.sizeNone,
  submenuIndicatorSize: 16,
  hovered: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground2Hover,
    iconColor: t.colors.neutralForeground2Hover,
    submenuIndicatorColor: t.colors.neutralForeground2Hover,
  },
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground2Pressed,
    iconColor: t.colors.neutralForeground2Pressed,
    submenuIndicatorColor: t.colors.neutralForeground2Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
    iconColor: t.colors.neutralForegroundDisabled,
    submenuIndicatorColor: t.colors.neutralForegroundDisabled,
  },
});
