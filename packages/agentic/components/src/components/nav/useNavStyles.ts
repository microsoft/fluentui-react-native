import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { navTokens } from './nav.styles';
import type { NavState } from './nav.types';

export function useNavStyles_unstable(state: NavState) {
  const tokens = getComponentTokens(state, navTokens);
  const panel = resolveTokenStates(tokens.panel, state).style;
  const { flexShrink, ...body } = resolveTokenStates(tokens.body, state).style;
  attachSlotProps(state.root, { style: state.userStyle });
  attachSlotProps(state.panel, { style: panel });
  attachSlotProps(state.body, { style: { flexShrink }, contentContainerStyle: body });
  if (state.header) attachSlotProps(state.header, { style: resolveTokenStates(tokens.header, state).style });
  if (state.footer) attachSlotProps(state.footer, { style: resolveTokenStates(tokens.footer, state).style });
}
