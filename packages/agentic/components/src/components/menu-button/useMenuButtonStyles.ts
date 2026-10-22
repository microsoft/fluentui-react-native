import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { buttonStyles, getButtonColorStyles, getButtonContentStyle, getButtonIconSize, getButtonRootStyle } from '../button/button.styles';
import { getMenuGap, getMenuThemeStyles } from '../menu/menu.styles';
import { getMenuButtonChevronSize } from './menu-button.styles';
import type { MenuButtonState } from './menu-button.types';

/**
 * Applies Button's chrome with content-layout metrics for every label and icon combination, the pressed colors while
 * the menu is presented, the chevron, and the menu family's surface style.
 */
export function useMenuButtonStyles_unstable(state: MenuButtonState) {
  const { size, userStyle } = state;
  const colors = getButtonColorStyles({ ...state, pressed: state.pressed || state.open });
  const rootLayoutStyle = getButtonRootStyle({ ...state, shape: 'rounded', iconOnly: false });
  const rootStyle: StyleProp<ViewStyle> = [buttonStyles.root, rootLayoutStyle, colors.background, userStyle];
  const contentStyle: StyleProp<TextStyle> = [buttonStyles.content, getButtonContentStyle(state), colors.foreground];
  const iconSize = getButtonIconSize(size);
  const chevronSize = getMenuButtonChevronSize(size);

  applyFocusRingStyles(state.FocusRing, state, rootLayoutStyle.borderRadius);
  attachSlotProps(state.root, { style: rootStyle });
  if (state.icon) {
    attachSlotProps(state.icon, { accessible: false, color: colors.foreground.color, height: iconSize, width: iconSize });
  }
  if (state.content) {
    attachSlotProps(state.content, { style: contentStyle });
  }
  attachSlotProps(state.chevron, { accessible: false, color: colors.foreground.color, height: chevronSize, width: chevronSize });
  state.popupProps.surfaceStyle = getMenuThemeStyles(state).surface;
  state.popupProps.gap = getMenuGap(state.tokens);
}
