import type { MenuListState } from './MenuList.types';
import type { MenuListContextValue } from '../context/menuListContext';

export const useMenuListContextValue = (state: MenuListState): MenuListContextValue => {
  return { hasCheckmarks: state.props.hasCheckmarks, hasTooltips: state.props.hasTooltips, ...state };
};
