import type { MenuEntryProps } from './menu-entry.types';
import { useMenuEntry_unstable } from './useMenuEntry';
import { useMenuEntryStyles_unstable } from './useMenuEntryStyles';
import { renderMenuEntry_unstable } from './renderMenuEntry';

export const MenuEntry = (props: MenuEntryProps) => {
  const state = useMenuEntry_unstable(props);
  useMenuEntryStyles_unstable(state);
  return renderMenuEntry_unstable(state);
};
MenuEntry.displayName = 'MenuEntry';
