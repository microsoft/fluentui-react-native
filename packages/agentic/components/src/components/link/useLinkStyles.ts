import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { linkTokens } from './link.styles';
import type { LinkState } from './link.types';

export function useLinkStyles_unstable(state: LinkState) {
  const tokens = getComponentTokens(state, linkTokens);
  const root = resolveTokenStates(tokens.root, state).style;
  const content = resolveTokenStates(tokens.content, state).style;
  attachSlotProps(state.root, { style: [root, state.userStyle] });
  attachSlotProps(state.content, { style: content });
  if (state.trailingIcon) {
    attachSlotDefaults(state.trailingIcon, { color: content.color, ...resolveTokenStates(tokens.trailingIcon, state).props });
  }
  applyFocusRingStyles(state.FocusRing, state, root.borderRadius);
}
