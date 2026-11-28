import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { tagPickerStyles, tagPickerTokens } from './tag-picker.styles';
import type { TagPickerState } from './tag-picker.types';

export function useTagPickerStyles_unstable(state: TagPickerState) {
  const tokens = getComponentTokens(state, tagPickerTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.control, state).style, state.userStyle] });
  attachSlotProps(state.tags, { style: resolveTokenStates(tokens.tags, state).style });
  attachSlotProps(state.picker, { style: [tagPickerStyles.picker, resolveTokenStates(tokens.editor, state).style] });
}
