/** @jsxImportSource @fluentui-react-native/framework-base */
import { useMenuSurface } from './useMenu';
import type { MenuExternalOptions } from './useMenu';
import { useMenuStyles_unstable } from './useMenuStyles';
import { renderMenu_unstable } from './renderMenu';
import type { MenuSubmenuContent } from './menu-entry.types';

export function MenuPopup({
  submenu,
  external,
  open,
  onOpenChange,
}: {
  submenu: MenuSubmenuContent;
  external: MenuExternalOptions;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const state = useMenuSurface({ ...submenu, open, onOpenChange }, external);
  const styles = useMenuStyles_unstable(state);
  return renderMenu_unstable(state, styles);
}
