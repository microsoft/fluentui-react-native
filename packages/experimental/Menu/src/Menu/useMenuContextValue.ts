import { MenuContextValue } from '../context/menuContext';
import { MenuState } from './Menu.types';

export const useMenuContextValue = (state: MenuState): MenuContextValue => {
  return { open: state.open, setOpen: state.setOpen, triggerRef: state.triggerRef };
};
