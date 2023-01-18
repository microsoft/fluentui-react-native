import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemCheckboxTokens } from './MenuItemCheckbox.types';

export const defaultMenuItemCheckboxTokens: TokenSettings<MenuItemCheckboxTokens, Theme> = (t: Theme): MenuItemCheckboxTokens => ({
  backgroundColor: t.colors.transparentBackground,
  borderRadius: 5,
  checkmarkPadding: globalTokens.sizeNone,
  checkmarkSize: 16,
  checkmarkVisibility: 0,
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size300,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  paddingHorizontal: 5,
  paddingVertical: 3,
  focused: {
    backgroundColor: t.colors.brandBackground,
    color: t.colors.brandedContent,
    checked: {
      checkmarkColor: t.colors.neutralForeground2Hover,
      checkmarkVisibility: 1,
    },
  },
  pressed: {
    backgroundColor: t.colors.brandBackgroundPressed,
    color: t.colors.brandedPressedContent,
    checked: {
      checkmarkColor: t.colors.brandedPressedContent,
      checkmarkVisibility: 1,
    },
  },
  disabled: {
    backgroundColor: t.colors.transparentBackground,
    color: t.colors.brandForeground1Disabled,
    checked: {
      checkmarkColor: t.colors.brandForeground1Disabled,
      checkmarkVisibility: 1,
    },
  },
  checked: {
    checkmarkColor: t.colors.neutralForeground2,
    checkmarkVisibility: 1,
  },
});
