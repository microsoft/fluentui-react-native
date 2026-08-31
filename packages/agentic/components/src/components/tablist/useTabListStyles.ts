import { attachSlotProps } from '@fluentui-react-native/framework-base';

import type { TabListState } from './tablist.types';
import { getTabListThemeStyles, tabListStaticStyles } from './tablist.styles';

export function useTabListStyles_unstable(state: TabListState): TabListState {
  const themeStyles = getTabListThemeStyles(state);
  attachSlotProps(state.root, {
    style: [themeStyles.root, tabListStaticStyles[state.orientation], state.userStyle],
  });
  return state;
}
