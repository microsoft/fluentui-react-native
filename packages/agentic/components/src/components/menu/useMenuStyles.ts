import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { usePopoverStyles_unstable } from '../popover/usePopoverStyles';
import { getMenuThemeStyles, menuStyles } from './menu.styles';
import type { MenuState } from './menu.types';
import { assertMenuPlatform } from './menu.platform';

export function useMenuStyles_unstable(state: MenuState) {
  assertMenuPlatform();
  const styles = usePopoverStyles_unstable(state);
  attachSlotProps(state.surfaceContent, {
    role: 'menu',
    focusable: false,
    style: getMenuThemeStyles(state).padding,
  });
  if (state.content) {
    attachSlotProps(state.content, { style: [menuStyles.content, state.contentUserStyle] });
  }
  return styles;
}
