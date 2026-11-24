import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { resolveButtonChrome } from '../button/button.styles';
import { applyButtonChrome } from '../button/useButtonStyles';
import { useMenuButtonStyles_unstable } from '../menu-button/useMenuButtonStyles';
import { splitButtonStyles, splitButtonTokens, splitPrimaryCorners, splitTriggerCorners } from './split-button.styles';
import type { SplitButtonState } from './split-button.types';

export function useSplitButtonStyles_unstable(state: SplitButtonState) {
  const tokens = getComponentTokens(state, splitButtonTokens);
  const primary = { size: state.size, appearance: state.appearance, visualState: state.primary.visualState };
  const menu = { ...primary, visualState: state.menuButton.visualState };
  const chrome = resolveButtonChrome(state.primary);
  const borderRadius = chrome.root.borderRadius;
  const outlined = state.appearance === 'outline';
  attachSlotProps(state.root, { style: [splitButtonStyles.root, resolveTokenStates(tokens.root, primary).style, state.userStyle] });
  attachSlotProps(state.divider, { style: resolveTokenStates(tokens.divider, primary).style });
  applyButtonChrome(state.primary, {
    ...chrome,
    root: { ...chrome.root, ...splitButtonStyles.primary, ...(outlined && { borderEndWidth: 0 }) },
  });
  applyFocusRingStyles(state.primary.FocusRing, state, borderRadius, splitPrimaryCorners);

  const { source, ...chevron } = resolveTokenStates(tokens.chevron, menu).props;
  state.menuButton.userStyle = [
    splitButtonStyles.trigger,
    resolveTokenStates(tokens.menuRegion, menu).style,
    { borderRadius, ...(outlined && { borderStartWidth: 0 }) },
  ];
  useMenuButtonStyles_unstable(state.menuButton);
  attachSlotProps(state.menuButton.chevron, { ...chevron, ...source });
  applyFocusRingStyles(state.menuButton.FocusRing, state, borderRadius, splitTriggerCorners);
}
