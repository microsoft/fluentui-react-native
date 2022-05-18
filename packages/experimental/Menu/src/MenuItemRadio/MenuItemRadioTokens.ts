import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { MenuItemRadioTokens } from './MenuItemRadio.types';

export const defaultMenuItemRadioTokens: TokenSettings<MenuItemRadioTokens, Theme> = (t: Theme): MenuItemRadioTokens => ({
  backgroundColor: t.colors.neutralBackground1,
  borderRadius: globalTokens.corner.radius.medium,
  checkmarkPadding: globalTokens.spacing.none,
  checkmarkSize: 16,
  checkmarkVisibility: 0,
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
    checked: {
      checkmarkColor: t.colors.neutralForeground2Hover,
      checkmarkVisibility: 1,
    },
  },
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
    color: t.colors.neutralForeground2Pressed,
    checked: {
      checkmarkColor: t.colors.neutralForeground2Pressed,
      checkmarkVisibility: 1,
    },
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled,
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
