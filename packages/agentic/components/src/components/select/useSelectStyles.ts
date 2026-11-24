import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { selectStyles, selectTokens } from './select.styles';
import type { SelectState } from './select.types';

export function useSelectStyles_unstable(state: SelectState) {
  const tokens = getComponentTokens(state, selectTokens);
  const style = resolveTokenStates(tokens.root, state).style;
  attachSlotProps(state.root, { style: [style, state.userStyle] });
  attachSlotProps(state.picker, { style: [selectStyles.picker, { minHeight: style.minHeight }] });
}
