import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { getMenuGap, getMenuThemeStyles, menuStyles } from './menu.styles';
import type { MenuState } from './menu.types';

/** Applies the root's structural style and the menu family's surface style and gap. Caller styles apply last. */
export function useMenuStyles_unstable(state: MenuState) {
  attachSlotProps(state.root, { style: [menuStyles.root, state.userStyle] });
  state.popupProps.surfaceStyle = getMenuThemeStyles(state).surface;
  state.popupProps.gap = getMenuGap(state.tokens);
}
