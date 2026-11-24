import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { resolveButtonChrome } from '../button/button.styles';
import { applyButtonChrome } from '../button/useButtonStyles';
import { compoundButtonTokens } from './compound-button.styles';
import type { CompoundButtonState } from './compound-button.types';

export function useCompoundButtonStyles_unstable(state: CompoundButtonState) {
  const tokens = getComponentTokens(state.themeState, compoundButtonTokens);
  const button = resolveButtonChrome(state);
  applyButtonChrome(state, { ...button, root: { ...button.root, ...resolveTokenStates(tokens.root, state).style } });
  if (state.image) {
    attachSlotProps(state.image, { style: resolveTokenStates(tokens.image, state).style });
  }
  attachSlotProps(state.textStack, { style: resolveTokenStates(tokens.contentStack, state).style });
  attachSlotProps(state.description, { style: [resolveTokenStates(tokens.description, state).style, state.secondaryContentStyle] });
}
