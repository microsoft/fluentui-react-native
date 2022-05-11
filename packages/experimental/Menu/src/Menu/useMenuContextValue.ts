import { MenuContextValue } from '../context/menuContext';
import { MenuState } from './Menu.types';

export const useMenuContextValue = (state: MenuState): MenuContextValue => {
  return { ...state };
};
