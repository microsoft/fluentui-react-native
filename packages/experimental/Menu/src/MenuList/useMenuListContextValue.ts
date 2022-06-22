import { MenuListContextValue } from '../context/menuListContext';
import { MenuListState } from './MenuList.types';

export const useMenuListContextValue = (state: MenuListState): MenuListContextValue => {
  return { hasCheckmarks: state.props.hasCheckmarks, ...state };
};
