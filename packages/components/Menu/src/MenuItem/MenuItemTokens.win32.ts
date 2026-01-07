import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { isHighContrast } from '@fluentui-react-native/theming-utils';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radiusNone,
  checkmarkSize: 16,
  color: t.colors.neutralForeground1,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size200,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  iconColor: t.colors.neutralForeground1,
  iconSize: 16,
  minHeight: 24,
  minWidth: 128,
  maxWidth: 300,
  padding: globalTokens.size40,
  paddingHorizontal: globalTokens.size80,
  submenuIndicatorColor: t.colors.neutralForeground1,
  submenuIndicatorPadding: globalTokens.size20,
  submenuIndicatorSize: 16,
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground1Pressed,
    iconColor: t.colors.neutralForeground1Pressed,
    submenuIndicatorColor: t.colors.neutralForeground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
    iconColor: t.colors.neutralForegroundDisabled,
    submenuIndicatorColor: t.colors.neutralForegroundDisabled,
  },
  focused: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground1Hover,
    iconColor: t.colors.neutralForeground1Hover,
    submenuIndicatorColor: t.colors.neutralForeground1Hover,
  },
  highlighted: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground1Hover,
    iconColor: t.colors.neutralForeground1Hover,
    submenuIndicatorColor: t.colors.neutralForeground1Hover,
    borderColor: isHighContrast(t) ? t.colors.compoundBrandStroke1 : t.colors.neutralForeground1,
    borderWidth: globalTokens.stroke.width20,
    padding: globalTokens.size40 - globalTokens.stroke.width20,
    paddingHorizontal: globalTokens.size80 - globalTokens.stroke.width20,
  },
});
