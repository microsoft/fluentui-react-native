import type { MenuListContextValue } from '../context/menuListContext';
import type { MenuListState } from './MenuList.types';

export const useMenuListContextValue = (state: MenuListState): MenuListContextValue => {
  return { hasCheckmarks: state.props.hasCheckmarks, ...state };
};
