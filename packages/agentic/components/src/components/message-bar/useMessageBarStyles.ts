import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { messageBarStyles, messageBarTokens } from './message-bar.styles';
import type { MessageBarState } from './message-bar.types';

export function useMessageBarStyles_unstable(state: MessageBarState) {
  const tokens = getComponentTokens(state, messageBarTokens);
  const root = resolveTokenStates(tokens.root, state).style;
  attachSlotProps(state.root, { style: [root, resolveTokenStates(tokens.tint, state).style, state.userStyle] });
  attachSlotProps(state.row, { style: [messageBarStyles.row, { gap: root.gap }] });
  attachSlotProps(state.message, { style: messageBarStyles.message });
  const { source: svgSource, ...icon } = resolveTokenStates(tokens.statusIcon, state).props;
  attachSlotProps(state.statusIcon, { ...icon, svgSource });
  const text = resolveTokenStates(tokens.content, state).style;
  attachSlotProps(state.content, { style: text });
  if (state.title) attachSlotProps(state.title, { style: [text, { fontWeight: state.tokens.fontWeight.functionalSemibold }] });
  if (state.actions) attachSlotProps(state.actions, { style: resolveTokenStates(tokens.actions, state).style });
  if (state.dismiss) attachSlotProps(state.dismiss, resolveTokenStates(tokens.dismiss, state).props);
}
