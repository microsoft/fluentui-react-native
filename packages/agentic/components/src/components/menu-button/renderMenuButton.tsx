/** @jsxImportSource @fluentui-react-native/framework-base */
import { MenuPopup } from '../menu/menuPopup';
import type { MenuButtonState } from './menu-button.types';

/** Renders the trigger Pressable with its leading icon, label, and chevron, and the menu popup family outside it. */
export function renderMenuButton_unstable(state: MenuButtonState) {
  const { chevron: Chevron, content: Content, icon: Icon } = state;
  return (
    <>
      <state.root ref={state.triggerRef}>
        {state.FocusRing && <state.FocusRing />}
        {Icon && <Icon />}
        {Content && <Content />}
        <Chevron />
      </state.root>
      <MenuPopup {...state.popupProps} />
    </>
  );
}
