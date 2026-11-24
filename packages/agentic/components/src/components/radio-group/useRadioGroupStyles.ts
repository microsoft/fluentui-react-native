import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { radioGroupTokens } from './radio-group.styles';
import type { RadioGroupState } from './radio-group.types';

export function useRadioGroupStyles_unstable(state: RadioGroupState) {
  const tokens = getComponentTokens(state, radioGroupTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
  attachSlotProps(state.options, { style: resolveTokenStates(tokens.options, state).style });
}
