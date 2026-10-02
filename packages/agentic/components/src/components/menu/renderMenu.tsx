/** @jsxImportSource @fluentui-react-native/framework-base */
import { renderPopover_unstable } from '../popover/renderPopover';
import { MenuContext } from './MenuContext';
import type { MenuState } from './menu.types';
import type { useMenuStyles_unstable } from './useMenuStyles';
import { assertMenuPlatform } from './menu.platform';

export function renderMenu_unstable(state: MenuState, styles: ReturnType<typeof useMenuStyles_unstable>) {
  assertMenuPlatform();
  return <MenuContext.Provider value={state.scope}>{renderPopover_unstable(state, styles)}</MenuContext.Provider>;
}
