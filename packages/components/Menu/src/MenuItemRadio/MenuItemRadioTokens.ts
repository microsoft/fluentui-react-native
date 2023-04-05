import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemRadioTokens } from './MenuItemRadio.types';

export const defaultMenuItemRadioTokens: TokenSettings<MenuItemRadioTokens, Theme> = (t: Theme): MenuItemRadioTokens => ({
  checkmarkSize: globalTokens.size120,
  color: t.colors.neutralForeground1,
  variant: 'body1',
  gap: globalTokens.size160,
  iconColor: t.colors.neutralForeground2,
  iconSize: globalTokens.size200,
  maxWidth: 300,
  paddingVertical: globalTokens.size60,
  paddingHorizontal: globalTokens.size160,

  radioOuterCircleSize: globalTokens.size200,
  radioInnerCircleSize: globalTokens.size100,
  radioBorderStyle: 'solid',
  radioBorderWidth: globalTokens.stroke.width15,
  rippleRadius: globalTokens.size160,

  // Unselected, Rest
  radioBorder: t.colors.neutralStrokeAccessible,
  radioVisibility: 0,

  rippleColor: '#D4D4D4',
  pressed: {
    backgroundColor: t.colors.neutralBackground1Pressed,
  },
  disabled: {
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForegroundDisabled1,
    iconColor: t.colors.neutralForegroundDisabled,
    // Unselected, Disabled
    rippleColor: '#D4D4D4',
    radioBorder: t.colors.neutralStrokeDisabled,
    radioVisibility: 0,
    checked: {
      radioBorder: t.colors.brandBackgroundDisabled,
      radioFill: t.colors.brandForegroundDisabled2,
      radioVisibility: 1,
    },
  },
  checked: {
    radioBorder: t.colors.brandBackground,
    radioFill: t.colors.brandForeground1,
    radioVisibility: 1,
  },
});
