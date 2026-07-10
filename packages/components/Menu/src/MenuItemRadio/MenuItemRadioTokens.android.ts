import type { Theme } from '@fluentui-react-native/framework';
import { size100, size120, size160, size200, size60, strokeWidth15 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuItemRadioTokens } from './MenuItemRadio.types';

export const defaultMenuItemRadioTokens: TokenSettings<MenuItemRadioTokens, Theme> = (t: Theme): MenuItemRadioTokens => ({
  checkmarkSize: size120,
  color: t.colors.neutralForeground1,
  variant: 'body1',
  gap: size160,
  iconColor: t.colors.neutralForeground2,
  iconSize: size200,
  maxWidth: 300,
  paddingVertical: size60,
  paddingHorizontal: size160,

  radioOuterCircleSize: size200,
  radioInnerCircleSize: size100,
  radioBorderStyle: 'solid',
  radioBorderWidth: strokeWidth15,
  rippleRadius: size160,

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
