import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { getMenuThemeStyles, menuStyles } from './menu.styles';
import type { MenuState } from './menu.types';

/** Applies the root's structural style and the menu family's surface style and gap. Caller styles apply last. */
export function useMenuStyles_unstable(state: MenuState) {
  attachSlotProps(state.root, { style: [menuStyles.root, state.userStyle] });
  const { surface, gap } = getMenuThemeStyles(state);
  state.popupProps.surfaceStyle = surface;
  state.popupProps.gap = gap;
}
