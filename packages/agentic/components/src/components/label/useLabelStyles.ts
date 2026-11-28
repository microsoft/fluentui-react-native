import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { labelTokens } from './label.styles';
import type { LabelState } from './label.types';

export function useLabelStyles_unstable(state: LabelState) {
  const tokens = getComponentTokens(state, labelTokens);
  attachSlotProps(state.root, { style: state.userStyle });
  attachSlotProps(state.row, { style: resolveTokenStates(tokens.root, state).style });
  attachSlotProps(state.text, { style: resolveTokenStates(tokens.text, state).style });
  if (state.requiredMark) attachSlotProps(state.requiredMark, { style: resolveTokenStates(tokens.requiredMark, state).style });
}
