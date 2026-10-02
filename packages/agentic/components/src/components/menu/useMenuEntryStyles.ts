import { useMenuItemStyles_unstable } from '../menu-item/useMenuItemStyles';
import type { MenuEntryState } from './menu-entry.types';
import { assertMenuPlatform } from './menu.platform';

export function useMenuEntryStyles_unstable(state: MenuEntryState) {
  assertMenuPlatform();
  useMenuItemStyles_unstable(state);
}
