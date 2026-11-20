import { resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { resolveButtonChrome } from '../button/button.styles';
import { applyButtonChrome } from '../button/useButtonStyles';
import { getMenuGap, getMenuThemeStyles } from '../menu/menu.styles';
import type { MenuButtonState } from './menu-button.types';

/**
 * Applies Button's chrome with content-layout metrics for every label and icon combination, the pressed colors while
 * the menu is presented, the chevron, and the menu family's surface style.
 */
export function useMenuButtonStyles_unstable(state: MenuButtonState) {
  const chrome = resolveButtonChrome(state);
  applyButtonChrome(state, chrome);
  const { source, ...chevron } = resolveTokenStates(state.menuButtonTokens.chevron, state).props;
  attachSlotProps(state.chevron, { ...chevron, ...source, accessible: false, color: chevron.color ?? chrome.content.color });
  state.popupProps.surfaceStyle = getMenuThemeStyles(state.themeState).surface;
  state.popupProps.gap = getMenuGap(state.tokens);
}
