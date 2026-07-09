import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius40,
  size120,
  size160,
  size200,
  size60,
  sizeNone,
  strokeWidth15,
  strokeWidthNone,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  checkmarkSize: size120,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground1,
  variant: 'body1',
  gap: size160,
  iconColor: t.colors.neutralForeground2,
  iconSize: size200,
  maxWidth: 300,
  paddingVertical: size60,
  paddingHorizontal: size160,
  checkmarkPadding: sizeNone,
  checkboxBorderWidth: strokeWidth15,
  checkboxBorderRadius: cornerRadius40,
  checkboxSize: size200,
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
    checkboxBorderWidth: strokeWidthNone,
    checkmarkColor: t.colors.neutralForegroundOnColor,
  },
});
