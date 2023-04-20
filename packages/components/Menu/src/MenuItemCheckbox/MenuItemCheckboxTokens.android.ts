import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  checkmarkSize: globalTokens.size120,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground1,
  variant: 'body1',
  gap: globalTokens.size160,
  iconColor: t.colors.neutralForeground2,
  iconSize: globalTokens.size200,
  maxWidth: 300,
  paddingVertical: globalTokens.size60,
  paddingHorizontal: globalTokens.size160,
  checkmarkPadding: globalTokens.sizeNone,
  checkboxBorderWidth: globalTokens.stroke.width15,
  checkboxBorderRadius: globalTokens.corner.radius40,
  checkboxSize: globalTokens.size200,
  checkboxBorderColor: t.colors.neutralStrokeAccessible,

  rippleColor: '#D4D4D4',
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    checkboxBorderColor: t.colors.neutralStrokeDisabled,
    color: t.colors.neutralForegroundDisabled1,
    iconColor: t.colors.neutralForegroundDisabled,
    // Unselected, Disabled
    rippleColor: '#D4D4D4',
    checked: {
      checkboxBackgroundColor: t.colors.brandBackgroundDisabled,
      checkmarkVisibility: 1,
    },
  },
  checked: {
    checkmarkVisibility: 1,
    checkboxBackgroundColor: t.colors.brandBackground,
    checkboxBorderWidth: globalTokens.stroke.widthNone,
    checkmarkColor: t.colors.neutralForegroundOnColor,
  },
});
