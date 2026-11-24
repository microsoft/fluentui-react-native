import { StyleSheet } from 'react-native';
import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { textareaStyles, textareaTokens } from './textarea.styles';
import type { TextareaState } from './textarea.types';

export function useTextareaStyles_unstable(state: TextareaState) {
  const tokens = getComponentTokens(state, textareaTokens);
  const rootStyle = [resolveTokenStates(tokens.root, state).style, state.userStyle];
  const editor = resolveTokenStates(tokens.editor, state);
  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.textInput, { ...editor.props, style: [textareaStyles.editor, editor.style, state.editorStyle] });
  applyFocusRingStyles(state.FocusRing, state, StyleSheet.flatten(rootStyle).borderRadius);
}
