import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { dialogStyles, dialogTokens } from './dialog.styles';
import type { DialogState } from './dialog.types';

export function useDialogStyles_unstable(state: DialogState) {
  const tokens = getComponentTokens(state, dialogTokens);
  const surface = resolveTokenStates(tokens.surface, {}).style;
  const width = Math.min(typeof surface.width === 'number' ? surface.width : 600, Math.max(1, state.width - 32));
  const maxHeight = Math.max(1, state.height - 96);
  attachSlotProps(state.root, { style: state.userStyle });
  attachSlotProps(state.window, { style: [dialogStyles.window, { width, maxHeight }] });
  attachSlotProps(state.surface, { style: [surface, { width, maxHeight }] });
  attachSlotProps(state.header, { style: resolveTokenStates(tokens.header, {}).style });
  attachSlotProps(state.title, { style: [dialogStyles.title, resolveTokenStates(tokens.title, {}).style] });
  if (state.body) attachSlotProps(state.body, { style: resolveTokenStates(tokens.body, {}).style });
  if (state.footer)
    attachSlotProps(state.footer, { style: [resolveTokenStates(tokens.footer, {}).style, state.stackFooter && dialogStyles.stack] });
}
