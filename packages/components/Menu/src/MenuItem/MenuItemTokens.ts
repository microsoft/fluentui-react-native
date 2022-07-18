import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius.medium,
  checkmarkSize: 16,
  submenuIndicatorPadding: globalTokens.spacing.none,
  submenuIndicatorSize: 16,
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size[300],
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.spacing.xs,
  minHeight: 32,
  minWidth: 160,
  maxWidth: 300,
  padding: globalTokens.spacing.sNudge,
  hovered: {
    backgroundColor: t.colors.neutralBackground1Hover,
    color: t.colors.neutralForeground2Hover,
  },
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground2Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
  },
});
