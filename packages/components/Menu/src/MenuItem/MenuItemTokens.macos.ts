import { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { PlatformColor } from 'react-native';
import { ColorWithSystemEffectMacOS } from 'react-native-macos';
import { MenuItemTokens } from './MenuItem.types';

export const defaultMenuItemTokens: TokenSettings<MenuItemTokens, Theme> = (t: Theme): MenuItemTokens => ({
  backgroundColor: t.colors.transparentBackground,
  borderRadius: 5, // hardcoded for now to match ContextualMenu
  checkmarkSize: 16,
  color: PlatformColor('labelColor'),
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size[300],
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.spacing.xs,
  paddingHorizontal: 5, // hardcoded for now to match ContextualMenu
  paddingVertical: 3, // hardcoded for now to match ContextualMenu
  submenuIndicatorPadding: globalTokens.spacing.none,
  submenuIndicatorSize: 16,
  focused: {
    backgroundColor: PlatformColor('controlAccentColor'),
    color: t.colors.neutralForegroundOnBrandHover,
  },
  pressed: {
    backgroundColor: ColorWithSystemEffectMacOS(PlatformColor('controlAccentColor'), 'pressed'),
    color: t.colors.neutralForegroundOnBrandPressed,
  },
  disabled: {
    backgroundColor: t.colors.transparentBackground,
    color: t.colors.neutralForegroundDisabled,
  },
});
