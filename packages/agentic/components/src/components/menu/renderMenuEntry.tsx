/** @jsxImportSource @fluentui-react-native/framework-base */
import { renderMenuItem_unstable } from '../menu-item/renderMenuItem';
import { MenuPopup } from './MenuPopup';
import type { MenuEntryState } from './menu-entry.types';
import { assertMenuPlatform } from './menu.platform';

export function renderMenuEntry_unstable(state: MenuEntryState) {
  assertMenuPlatform();
  return (
    <>
      {renderMenuItem_unstable(state)}
      {state.submenu && (
        <MenuPopup
          submenu={state.submenu}
          open={state.submenuOpen}
          onOpenChange={state.requestSubmenu}
          external={{ parent: state.scope, itemId: state.itemId, attachment: state.anchor }}
        />
      )}
    </>
  );
}
