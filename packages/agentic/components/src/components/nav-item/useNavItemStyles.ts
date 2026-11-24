import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { navItemStyles, navItemTokens } from './nav-item.styles';
import type { NavItemState } from './nav-item.types';

export function useNavItemStyles_unstable(state: NavItemState) {
  const tokens = getComponentTokens(state, navItemTokens);
  const primary = resolveTokenStates(tokens.primary, state).style;
  const label = resolveTokenStates(tokens.label, state).style;
  const { avatarSize, ...leading } = resolveTokenStates(tokens.leading, state).props;
  attachSlotProps(state.root, { style: [navItemStyles.root, state.userStyle] });
  attachSlotProps(state.primary, { style: [navItemStyles.primary, primary, !state.label && navItemStyles.iconOnly] });
  if (state.label) attachSlotProps(state.label, { style: [navItemStyles.label, label] });
  if (state.icon) attachSlotDefaults(state.icon, { ...leading, color: label.color });
  if (state.avatar) attachSlotDefaults(state.avatar, { size: avatarSize });
  if (state.chevron) attachSlotProps(state.chevron, { ...leading, color: label.color });
  if (state.indicator)
    attachSlotProps(state.indicator, { style: [navItemStyles.indicator, resolveTokenStates(tokens.indicator, state).style] });
  applyFocusRingStyles(state.FocusRing, state, primary.borderRadius);
}
