import { MenuContextValue } from '../context/menuContext';
import { MenuState } from './Menu.types';

export const useMenuContextValue = (_state: MenuState): MenuContextValue => {
  return { open: false };
};
