import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  checkmarkSize: globalTokens.size200,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground1,
  variant: 'body1',
  gap: globalTokens.size40,
  iconColor: t.colors.neutralForeground2,
  iconSize: globalTokens.size200,
  paddingVertical: globalTokens.size60,
  paddingHorizontal: globalTokens.size160,
  checkmarkPadding: globalTokens.sizeNone,
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled1,
    iconColor: t.colors.neutralForegroundDisabled,
    checked: {
      checkmarkColor: t.colors.neutralForegroundDisabled,
      checkmarkVisibility: 1,
    },
  },
  checked: {
    checkmarkColor: t.colors.neutralForeground2,
    checkmarkVisibility: 1,
  },
});
