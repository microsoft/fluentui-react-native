import { useMenuContext } from '../context/menuContext';
import { MenuItemProps, MenuItemState } from './MenuItem.types';

export const useMenuItem = (_props: MenuItemProps): MenuItemState => {
  const context = useMenuContext();

  const triggerRef = context.triggerRef;

  return { triggerRef };
};
