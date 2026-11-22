import { attachSlotProps } from '@fluentui-react-native/framework-base';

import type { TabListState } from './tablist.types';
import { getTabListRootStyle } from './tablist.styles';

export function useTabListStyles_unstable(state: TabListState): TabListState {
  attachSlotProps(state.root, {
    style: [getTabListRootStyle(state), state.userStyle],
  });
  return state;
}
