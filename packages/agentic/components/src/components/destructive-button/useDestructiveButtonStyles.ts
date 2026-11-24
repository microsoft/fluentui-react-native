import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { resolveButtonChrome } from '../button/button.styles';
import { applyButtonChrome } from '../button/useButtonStyles';
import { destructiveButtonTokens } from './destructive-button.styles';
import type { DestructiveButtonState } from './destructive-button.types';

export function useDestructiveButtonStyles_unstable(state: DestructiveButtonState) {
  const tokens = getComponentTokens(state.themeState, destructiveButtonTokens);
  const base = resolveButtonChrome(state);
  applyButtonChrome(
    state,
    {
      root: { ...base.root, ...resolveTokenStates(tokens.root, state).style },
      content: { ...base.content, ...resolveTokenStates(tokens.content, state).style },
      icon: { ...base.icon, ...resolveTokenStates(tokens.icon, state).props },
    },
    { trailing: !!state.trailingIcon },
  );
  if (state.leadingIcon) attachSlotProps(state.leadingIcon, hiddenFromAccessibilityProps);
  if (state.trailingIcon) attachSlotProps(state.trailingIcon, hiddenFromAccessibilityProps);
}
