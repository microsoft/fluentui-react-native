import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { treeSurfaceStyle } from '../tree-item/treeSurfaceStyle';
import { treeTokens } from './tree.styles';
import type { TreeState } from './tree.types';

export function useTreeStyles_unstable(state: TreeState) {
  const tokens = getComponentTokens(state, treeTokens);
  attachSlotProps(state.root, { style: [treeSurfaceStyle(resolveTokenStates(tokens.root, state).style), state.userStyle] });
  state.itemSize = resolveTokenStates(tokens.item, state).props.size ?? state.size;
}
