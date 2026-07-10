import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { fontWeightRegular, size20, size40 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemRadioTokens } from './MenuItemRadio.types';

export const defaultMenuItemRadioTokens: TokenSettings<MenuItemRadioTokens, Theme> = (t: Theme): MenuItemRadioTokens => ({
  backgroundColor: t.colors.transparentBackground,
  borderRadius: 5, // hardcoded for now to match NSMenu
  checkmarkPadding: size20,
  checkmarkSize: 16,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground1,
  fontFamily: t.typography.families.primary,
  fontSize: 13, // aligning with NSMenu font size
  fontWeight: fontWeightRegular as FontWeightValue,
  gap: size40,
  iconColor: t.colors.neutralForeground1,
  iconSize: 16,
  padding: size40,
  paddingHorizontal: 5, // hardcoded for now to match NSMenu
  paddingVertical: 3, // hardcoded for now to match NSMenu
  pressed: {
    backgroundColor: t.colors.menuItemBackgroundPressed,
    color: t.colors.menuItemTextHovered,
    iconColor: t.colors.menuItemTextHovered,
    checked: {
      checkmarkColor: t.colors.menuItemTextHovered,
      checkmarkVisibility: 1,
    },
  },
  disabled: {
    backgroundColor: t.colors.menuBackground,
    color: t.colors.disabledText,
    iconColor: t.colors.disabledText,
    checked: {
      checkmarkColor: t.colors.disabledText,
      checkmarkVisibility: 1,
    },
  },
  focused: {
    backgroundColor: t.colors.menuItemBackgroundHovered,
    color: t.colors.menuItemTextHovered,
    iconColor: t.colors.menuItemTextHovered,
    checked: {
      checkmarkColor: t.colors.menuItemTextHovered,
      checkmarkVisibility: 1,
    },
  },
  checked: {
    checkmarkColor: t.colors.neutralForeground1,
    checkmarkVisibility: 1,
  },
});
