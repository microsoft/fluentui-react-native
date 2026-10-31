/** @jsxImportSource @fluentui-react-native/framework-base */
import { MenuPopup } from './menuPopup';
import type { MenuState } from './menu.types';

/** Renders the trigger and the menu's native popup family. */
export function renderMenu_unstable(state: MenuState) {
  const { trigger: Trigger } = state;
  return (
    <state.root>
      <Trigger ref={state.anchorRef} />
      <MenuPopup {...state.popupProps} />
    </state.root>
  );
}
