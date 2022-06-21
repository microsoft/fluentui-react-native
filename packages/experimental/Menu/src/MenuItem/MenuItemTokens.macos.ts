import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.transparentBackground,
  borderRadius: 5, // hardcoded for now to match ContextualMenu
  checkmarkSize: 16,
  submenuIndicatorPadding: globalTokens.spacing.none,
  submenuIndicatorSize: 16,
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size[300],
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.spacing.xs,
  paddingHorizontal: 5, // hardcoded for now to match ContextualMenu
  paddingVertical: 3, // hardcoded for now to match ContextualMenu
  focused: {
    backgroundColor: t.colors.brandBackground,
    color: t.colors.brandedContent,
  },
  pressed: {
    backgroundColor: t.colors.brandBackgroundPressed,
    color: t.colors.brandedPressedContent,
  },
  disabled: {
    backgroundColor: t.colors.transparentBackground,
    color: t.colors.neutralForegroundDisabled,
  },
});
