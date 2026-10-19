import type { MenuButtonProps } from './menu-button.types';
import { useMenuButton_unstable } from './useMenuButton';
import { useMenuButtonStyles_unstable } from './useMenuButtonStyles';
import { renderMenuButton_unstable } from './renderMenuButton';

/** A Button-styled trigger with a down chevron that opens a Menu of actions. */
export const MenuButton = (props: MenuButtonProps) => {
  const state = useMenuButton_unstable(props);
  useMenuButtonStyles_unstable(state);
  return renderMenuButton_unstable(state);
};
MenuButton.displayName = 'MenuButton';

export default MenuButton;
