import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { toolbarTokens } from './toolbar.styles';
import type { ToolbarState } from './toolbar.types';

export function useToolbarStyles_unstable(state: ToolbarState) {
  const tokens = getComponentTokens(state, toolbarTokens);
  attachSlotProps(state.root, { style: [resolveTokenStates(tokens.root, state).style, state.userStyle] });
}
