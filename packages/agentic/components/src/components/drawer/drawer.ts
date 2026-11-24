import type { DrawerProps } from './drawer.types';
import { renderDrawer_unstable } from './renderDrawer';
import { useDrawer_unstable } from './useDrawer';
import { useDrawerStyles_unstable } from './useDrawerStyles';

export function Drawer(props: DrawerProps) {
  const state = useDrawer_unstable(props);
  useDrawerStyles_unstable(state);
  return renderDrawer_unstable(state);
}
Drawer.displayName = 'Drawer';
