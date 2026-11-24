import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { listTokens } from './list.styles';
import type { ListState } from './list.types';

export function useListStyles_unstable(state: ListState) {
  const tokens = getComponentTokens(state, listTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
  state.itemSize = resolveTokenStates(tokens.item, state).props.size ?? state.size;
}
